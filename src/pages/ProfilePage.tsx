import { useState, useEffect } from "react";
import { User, BookOpen, MessageSquare, Trophy, TrendingUp, Calendar, Award, Star, Target, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ProfileEditor } from "@/components/ProfileEditor";
import { DataExport } from "@/components/DataExport";
import { QRCodeCustomizer } from "@/components/QRCodeCustomizer";
import { RecentStudyPartners } from "@/components/RecentStudyPartners";
import { SocialIntegrations } from "@/components/SocialIntegrations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessage {
  id: string;
  content: string;
  role: string;
  created_at: string;
}

interface StudyStats {
  totalSessions: number;
  totalMinutes: number;
  weekSessions: number;
  avgSessionDuration: number;
  favoriteSubject: string;
  studyStreak: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points_required: number;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

interface MoodLog {
  mood_score: number;
  created_at: string;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState({ 
    full_name: "", 
    email: "",
    avatar_url: "",
    bio: "",
    study_goals: [] as string[],
    preferred_subjects: [] as string[],
  });
  const [userId, setUserId] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [studyStats, setStudyStats] = useState<StudyStats>({
    totalSessions: 0,
    totalMinutes: 0,
    weekSessions: 0,
    avgSessionDuration: 0,
    favoriteSubject: "-",
    studyStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [moodData, setMoodData] = useState<MoodLog[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile({
        full_name: profileData?.full_name || "Student",
        email: user.email || "",
        avatar_url: profileData?.avatar_url || "",
        bio: profileData?.bio || "",
        study_goals: profileData?.study_goals || [],
        preferred_subjects: profileData?.preferred_subjects || [],
      });

      // Load chat history (last 50 messages)
      const { data: chats } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setChatHistory(chats || []);

      // Load study statistics
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id);

      if (sessions) {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const weekSessions = sessions.filter(
          (s) => new Date(s.created_at!) >= weekAgo
        );

        const totalMinutes = sessions.reduce(
          (sum, s) => sum + (s.duration_minutes || 0),
          0
        );

        // Find favorite subject
        const subjectCounts: Record<string, number> = {};
        sessions.forEach((s) => {
          subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
        });
        const favoriteSubject = Object.keys(subjectCounts).length > 0
          ? Object.keys(subjectCounts).reduce((a, b) =>
              subjectCounts[a] > subjectCounts[b] ? a : b
            )
          : "-";

        // Calculate study streak
        const { data: patterns } = await supabase
          .from("study_patterns")
          .select("streak_days")
          .eq("user_id", user.id)
          .single();

        setStudyStats({
          totalSessions: sessions.length,
          totalMinutes,
          weekSessions: weekSessions.length,
          avgSessionDuration: sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0,
          favoriteSubject,
          studyStreak: patterns?.streak_days || 0,
        });
      }

      // Load user badges
      const { data: userBadgesData } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", user.id);

      if (userBadgesData && userBadgesData.length > 0) {
        const badgeIds = userBadgesData.map((ub: UserBadge) => ub.badge_id);
        const { data: badgesData } = await supabase
          .from("badges")
          .select("*")
          .in("id", badgeIds);

        setEarnedBadges(badgesData || []);
      }

      // Load user points and level
      const { data: pointsData } = await supabase
        .from("user_points")
        .select("total_points, level")
        .eq("user_id", user.id)
        .single();

      if (pointsData) {
        setUserPoints(pointsData.total_points || 0);
        setUserLevel(pointsData.level || 1);
      }

      // Load mood data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: moodLogsData } = await supabase
        .from("mood_logs")
        .select("mood_score, created_at")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      setMoodData(moodLogsData || []);

      // Calculate leaderboard rank
      const { data: allUsers } = await supabase
        .from("user_points")
        .select("user_id, total_points")
        .order("total_points", { ascending: false });

      if (allUsers) {
        const rank = allUsers.findIndex(u => u.user_id === user.id) + 1;
        setLeaderboardRank(rank > 0 ? rank : null);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="w-8 h-8 text-primary" />
          My APEX Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Your personalized dashboard with achievements, stats & progress
        </p>
      </div>

      {/* Profile Header */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>
                <User className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">
                  <Trophy className="w-3 h-3 mr-1" />
                  Level {userLevel}
                </Badge>
                <Badge variant="outline">
                  🔥 {studyStats.studyStreak} day streak
                </Badge>
                {leaderboardRank && (
                  <Badge variant="default">
                    <Star className="w-3 h-3 mr-1" />
                    #{leaderboardRank} Rank
                  </Badge>
                )}
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  <Zap className="w-3 h-3 mr-1" />
                  {userPoints} pts
                </Badge>
              </div>
            </div>
          </div>

          {/* Study Goals and Subjects */}
          {(profile.study_goals.length > 0 || profile.preferred_subjects.length > 0) && (
            <div className="mt-4 pt-4 border-t space-y-3">
              {profile.study_goals.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Study Goals:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.study_goals.map((goal, i) => (
                      <Badge key={i} variant="secondary">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.preferred_subjects.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Preferred Subjects:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_subjects.map((subject, i) => (
                      <Badge key={i} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Editor */}
      <ProfileEditor 
        profile={profile} 
        userId={userId}
        onUpdate={loadProfileData}
      />

      {/* Achievements & Badges Showcase */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Achievements & Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnedBadges.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No badges earned yet. Keep studying to unlock achievements!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center p-4 rounded-lg bg-card border border-border hover:border-primary transition-colors group"
                >
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {badge.icon}
                  </div>
                  <h4 className="font-semibold text-sm text-center">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                    {badge.description}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {badge.category}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mood & Wellness Trend */}
      {moodData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Mood & Wellness Trend (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {moodData.map((mood, index) => {
                const height = (mood.mood_score / 5) * 100;
                const color = mood.mood_score >= 4 ? 'bg-green-500' : 
                              mood.mood_score >= 3 ? 'bg-blue-500' : 
                              mood.mood_score >= 2 ? 'bg-yellow-500' : 'bg-red-500';
                return (
                  <div
                    key={index}
                    className={`flex-1 ${color} rounded-t transition-all hover:opacity-80`}
                    style={{ height: `${height}%` }}
                    title={`Mood: ${mood.mood_score}/5 on ${new Date(mood.created_at).toLocaleDateString()}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
            <div className="mt-4 flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Great (4-5)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Good (3)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Fair (2)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Low (1)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Goals Progress */}
      {profile.study_goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Study Goals Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.study_goals.map((goal, index) => {
              // Calculate progress based on study sessions (simplified)
              const progress = Math.min(100, (studyStats.totalSessions / (index + 5)) * 100);
              return (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{goal}</span>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Data Export */}
      <DataExport />

      {/* Recent Study Partners */}
      <RecentStudyPartners />

      {/* QR Code Customizer */}
      <QRCodeCustomizer userId={userId} userName={profile.full_name} />

      {/* Social Integrations */}
      <SocialIntegrations 
        userId={userId}
        userName={profile.full_name}
        studyStats={{
          totalSessions: studyStats.totalSessions,
          totalMinutes: studyStats.totalMinutes,
          studyStreak: studyStats.studyStreak,
        }}
      />

      {/* Study Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studyStats.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {studyStats.weekSessions} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.floor(studyStats.totalMinutes / 60)}h {studyStats.totalMinutes % 60}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {studyStats.avgSessionDuration}min per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Favorite Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyStats.favoriteSubject}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Most studied topic
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chat History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            AI Chat History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Messages</TabsTrigger>
              <TabsTrigger value="user">My Questions</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ScrollArea className="h-[400px] pr-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No chat history yet. Start chatting with the AI!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary/5 border-l-2 border-primary"
                            : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant={message.role === "user" ? "default" : "secondary"}>
                            {message.role === "user" ? "You" : "AI"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap line-clamp-3">
                          {message.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="user">
              <ScrollArea className="h-[400px] pr-4">
                {chatHistory.filter((m) => m.role === "user").length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No questions asked yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory
                      .filter((m) => m.role === "user")
                      .map((message) => (
                        <div
                          key={message.id}
                          className="p-4 rounded-lg bg-primary/5 border-l-2 border-primary"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Badge>Your Question</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
