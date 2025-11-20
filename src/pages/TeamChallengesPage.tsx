import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, Trophy, Target, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Team {
  id: string;
  name: string;
  description: string;
  team_points: number;
  created_by: string;
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
  user_name: string;
  role: string;
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
  const { toast } = useToast();

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('team-challenges-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_challenges' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_challenge_progress' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load all teams
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*')
        .eq('is_active', true)
        .order('team_points', { ascending: false });

      setTeams(teamsData || []);

      // Load my team
      const { data: membership } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single();

      if (membership) {
        const myTeamData = teamsData?.find((t) => t.id === membership.team_id);
        if (myTeamData) {
          setMyTeam(myTeamData);

          // Load team members
          const { data: members } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_id', myTeamData.id);

          setTeamMembers(members || []);

          // Load challenge progress
          const { data: progress } = await supabase
            .from('team_challenge_progress')
            .select('*, team_challenges(*)')
            .eq('team_id', myTeamData.id);

          setChallengeProgress(progress || []);
        }
      }

      // Load all challenges
      const { data: challengesData } = await supabase
        .from('team_challenges')
        .select('*')
        .order('start_date', { ascending: false });

      setChallenges(challengesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
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
        .single();

      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert([{
          name: newTeamName,
          description: newTeamDesc,
          created_by: user.id,
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
        .single();

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

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          Team Challenges
        </h1>
        <p className="text-muted-foreground mt-1">
          Compete with your team and earn bonus rewards
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
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Team Points</p>
                    <p className="text-3xl font-bold text-primary">{myTeam.team_points}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Team Members ({teamMembers.length})</h3>
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span>{member.user_name}</span>
                        <Badge variant={member.role === 'leader' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
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
