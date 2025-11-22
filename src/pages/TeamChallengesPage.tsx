import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, Trophy, Target, Plus, LogOut, Share2, MessageCircle, Send, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BackButton } from "@/components/BackButton";

interface Team {
  id: string;
  name: string;
  description: string;
  team_points: number;
  created_by: string;
  invite_code: string | null;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  bonus_points: number;
  start_date: string;
  end_date: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  avatar_url?: string;
  isOnline?: boolean;
}

interface ChatMessage {
  id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export default function TeamChallengesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [challengeProgress, setChallengeProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('team-challenges-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setTeams(prev => [...prev, payload.new as Team]);
        } else if (payload.eventType === 'UPDATE') {
          setTeams(prev => prev.map(t => t.id === payload.new.id ? payload.new as Team : t));
          if (myTeam && payload.new.id === myTeam.id) {
            setMyTeam(payload.new as Team);
          }
        } else if (payload.eventType === 'DELETE') {
          setTeams(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, async (payload) => {
        const teamId = (payload.new as any)?.team_id || (payload.old as any)?.team_id;
        if (myTeam && teamId === myTeam.id) {
          const { data: membersData } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_id', myTeam.id);
          
          if (membersData) {
            const memberIds = membersData.map(m => m.user_id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, avatar_url')
              .in('id', memberIds);

            const membersWithAvatars = membersData.map(member => ({
              ...member,
              avatar_url: profiles?.find(p => p.id === member.user_id)?.avatar_url
            }));

            setTeamMembers(membersWithAvatars);
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_challenges' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setChallenges(prev => [...prev, payload.new as Challenge]);
        } else if (payload.eventType === 'UPDATE') {
          setChallenges(prev => prev.map(c => c.id === payload.new.id ? payload.new as Challenge : c));
        } else if (payload.eventType === 'DELETE') {
          setChallenges(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_challenge_progress' }, async (payload) => {
        const teamId = (payload.new as any)?.team_id || (payload.old as any)?.team_id;
        if (myTeam && teamId === myTeam.id) {
          const { data: progressData } = await supabase
            .from('team_challenge_progress')
            .select('*, team_challenges(*)')
            .eq('team_id', myTeam.id);
          
          setChallengeProgress(progressData || []);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'team_chat_messages' }, (payload) => {
        if (payload.new && myTeam && (payload.new as any).team_id === myTeam.id) {
          setChatMessages(prev => [...prev, payload.new as ChatMessage]);
          setTimeout(() => {
            chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myTeam]);

  // Setup presence tracking when user joins a team
  useEffect(() => {
    if (!myTeam) return;

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const presenceChannel = supabase.channel(`team-${myTeam.id}-presence`)
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const online = new Set<string>();
          Object.values(state).forEach((presences: any) => {
            presences.forEach((presence: any) => {
              online.add(presence.user_id);
            });
          });
          setOnlineUsers(online);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          setOnlineUsers(prev => {
            const updated = new Set(prev);
            newPresences.forEach((p: any) => updated.add(p.user_id));
            return updated;
          });
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          setOnlineUsers(prev => {
            const updated = new Set(prev);
            leftPresences.forEach((p: any) => updated.delete(p.user_id));
            return updated;
          });
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        });

      return () => {
        presenceChannel.unsubscribe();
      };
    };

    setupPresence();
  }, [myTeam]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Load all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('is_active', true)
        .order('team_points', { ascending: false });

      if (teamsError) {
        console.error('Error loading teams:', teamsError);
        toast({
          title: 'Error loading teams',
          description: teamsError.message,
          variant: 'destructive'
        });
      }

      setTeams(teamsData || []);

      // Load my team
      const { data: membership } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (membership) {
        const myTeamData = teamsData?.find((t) => t.id === membership.team_id);
        if (myTeamData) {
          setMyTeam(myTeamData);

          // Load team members with profiles in parallel
          const [membersResult, messagesResult, progressResult] = await Promise.all([
            supabase
              .from('team_members')
              .select('*')
              .eq('team_id', myTeamData.id),
            supabase
              .from('team_chat_messages')
              .select('*')
              .eq('team_id', myTeamData.id)
              .order('created_at', { ascending: true })
              .limit(100),
            supabase
              .from('team_challenge_progress')
              .select('*, team_challenges(*)')
              .eq('team_id', myTeamData.id)
          ]);

          if (membersResult.data) {
            // Fetch profiles for avatars
            const memberIds = membersResult.data.map(m => m.user_id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, avatar_url')
              .in('id', memberIds);

            const membersWithAvatars = membersResult.data.map(member => ({
              ...member,
              avatar_url: profiles?.find(p => p.id === member.user_id)?.avatar_url
            }));

            setTeamMembers(membersWithAvatars);
          }

          setChatMessages(messagesResult.data || []);
          setChallengeProgress(progressResult.data || []);
        }
      } else {
        setMyTeam(null);
        setTeamMembers([]);
        setChallengeProgress([]);
        setChatMessages([]);
      }

      // Load all challenges
      const { data: challengesData } = await supabase
        .from('team_challenges')
        .select('*')
        .order('start_date', { ascending: false });

      setChallenges(challengesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error loading data',
        description: 'Please try refreshing the page',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

   const createTeam = async () => {
    if (!newTeamName.trim()) {
      toast({ title: 'Team name required', variant: 'destructive' });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      // Generate invite code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_team_invite_code');
      
      if (codeError) {
        console.error('Error generating code:', codeError);
        toast({ title: 'Failed to generate invite code', variant: 'destructive' });
        return;
      }

      const generatedCode = codeData as string;

      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert([{
          name: newTeamName,
          description: newTeamDesc,
          created_by: user.id,
          invite_code: generatedCode,
        }])
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as team leader
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: team.id,
          user_id: user.id,
          user_name: profile?.full_name || 'User',
          role: 'leader',
        }]);

      if (memberError) throw memberError;

      toast({ title: 'Team created successfully!' });
      setNewTeamName('');
      setNewTeamDesc('');
      loadData();
    } catch (error) {
      console.error('Error creating team:', error);
      toast({ title: 'Failed to create team', variant: 'destructive' });
    }
  };

  const joinTeamByCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find team by invite code
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (teamError || !team) {
        toast({
          title: 'Invalid code',
          description: 'No team found with this invite code.',
          variant: 'destructive',
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      const { error } = await supabase.from('team_members').insert({
        team_id: team.id,
        user_id: user.id,
        user_name: profile?.full_name || 'User',
        role: 'member',
      });

      if (error) throw error;

      toast({
        title: 'Joined team!',
        description: `You've successfully joined ${team.name}.`,
      });

      setInviteCode('');
      loadData();
    } catch (error: any) {
      console.error('Error joining team:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to join team. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const copyInviteCode = () => {
    if (myTeam?.invite_code) {
      navigator.clipboard.writeText(myTeam.invite_code);
      toast({
        title: 'Copied!',
        description: 'Invite code copied to clipboard.',
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !myTeam) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      await supabase.from('team_chat_messages').insert({
        team_id: myTeam.id,
        user_id: user.id,
        user_name: profile?.full_name || 'User',
        message: newMessage,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    }
  };

  const joinTeam = async (teamId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already a member
      const { data: existingMembership } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMembership) {
        toast({ title: 'You are already a member of this team' });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      const { error } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: user.id,
          user_name: profile?.full_name || 'User',
        }]);

      if (error) throw error;

      toast({ title: 'Joined team successfully!' });
      loadData();
    } catch (error) {
      console.error('Error joining team:', error);
      toast({ title: 'Failed to join team', variant: 'destructive' });
    }
  };

  const leaveTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !myTeam) return;

      await supabase
        .from('team_members')
        .delete()
        .eq('team_id', myTeam.id)
        .eq('user_id', user.id);

      toast({ title: 'Left team successfully!' });
      setMyTeam(null);
      setTeamMembers([]);
      setChallengeProgress([]);
      loadData();
    } catch (error) {
      console.error('Error leaving team:', error);
      toast({ title: 'Failed to leave team', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          Team Competitions
        </h1>
        <p className="text-muted-foreground mt-1">
          Join forces with your team and complete challenges together for exclusive rewards
        </p>
      </div>

      <Tabs defaultValue={myTeam ? "my-team" : "teams"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-team">My Team</TabsTrigger>
          <TabsTrigger value="teams">All Teams</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="my-team" className="space-y-4">
          {!myTeam ? (
            <Card className="p-6 text-center space-y-4">
              <Users className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Join or Create a Team</h3>
                <p className="text-muted-foreground mb-4">
                  Team up with other students to complete challenges together
                </p>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create a New Team</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Team Name</label>
                          <Input
                            placeholder="Enter team name"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Description</label>
                          <Textarea
                            placeholder="Describe your team..."
                            value={newTeamDesc}
                            onChange={(e) => setNewTeamDesc(e.target.value)}
                            rows={3}
                          />
                        </div>
                        <Button onClick={createTeam} className="w-full">
                          Create Team
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Join with Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Join Team</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Invite Code</label>
                          <Input
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            placeholder="Enter 6-character code"
                            maxLength={6}
                            className="font-mono text-center text-lg"
                          />
                        </div>
                        <Button onClick={joinTeamByCode} className="w-full">
                          Join Team
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{myTeam.name}</h2>
                    <p className="text-muted-foreground">{myTeam.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Team Points</p>
                      <p className="text-3xl font-bold text-primary">{myTeam.team_points}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={leaveTeam}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Leave Team
                    </Button>
                  </div>
                </div>

                {myTeam?.invite_code && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-1">Invite Code</p>
                      <p className="font-mono text-lg">{myTeam.invite_code}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={copyInviteCode}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-semibold mb-3">Team Members ({teamMembers.length})</h3>
                  <div className="grid gap-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback>{member.user_name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {onlineUsers.has(member.user_id) && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{member.user_name}</p>
                        </div>
                        <Badge variant={member.role === 'leader' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Team Chat
                  </h3>
                  <Card className="p-4">
                    <ScrollArea className="h-[300px] mb-4">
                      <div className="space-y-3">
                        {chatMessages.length === 0 ? (
                          <p className="text-center text-muted-foreground text-sm py-8">
                            No messages yet. Start the conversation!
                          </p>
                        ) : (
                          chatMessages.map((msg) => (
                            <div key={msg.id} className="flex gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{msg.user_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(msg.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm bg-muted p-2 rounded">{msg.message}</p>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={chatScrollRef} />
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button onClick={sendMessage} size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Active Challenges
                </h3>
                <div className="space-y-4">
                  {challengeProgress.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No active challenges yet. Start completing activities!
                    </p>
                  ) : (
                    challengeProgress.map((progress) => (
                      <div key={progress.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{progress.team_challenges.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {progress.current_value} / {progress.team_challenges.target_value}
                            </p>
                          </div>
                          {progress.completed && (
                            <Badge className="bg-green-500">Completed!</Badge>
                          )}
                        </div>
                        <Progress
                          value={(progress.current_value / progress.team_challenges.target_value) * 100}
                        />
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">{team.description}</p>
                  </div>
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Points: </span>
                    <span className="font-bold">{team.team_points}</span>
                  </div>
                  {!myTeam && (
                    <Button size="sm" onClick={() => joinTeam(team.id)}>
                      Join
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Target className="w-6 h-6 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-bold">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-medium">{challenge.target_value}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bonus Points:</span>
                    <span className="font-bold text-primary">+{challenge.bonus_points}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ends:</span>
                    <span>{new Date(challenge.end_date).toLocaleDateString()}</span>
                  </div>
                  <Badge variant="outline" className="w-full justify-center">
                    {challenge.challenge_type}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
