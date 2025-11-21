import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Trophy, Award, Star, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackButton } from "@/components/BackButton";

interface UserPoints {
  total_points: number;
  level: number;
}

interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  category: string;
  earned?: boolean;
  earned_at?: string;
}

interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  points: number;
  rank?: number;
}

export default function GamificationPage() {
  const [userPoints, setUserPoints] = useState<UserPoints>({ total_points: 0, level: 1 });
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('gamification-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_points' }, () => loadGamificationData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_badges' }, () => loadGamificationData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard_entries' }, () => loadGamificationData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadGamificationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Parallel fetch all data for faster loading
      const [pointsResult, allBadgesResult, earnedBadgesResult, leaderboardResult] = await Promise.all([
        supabase
          .from('user_points')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase.from('badges').select('*'),
        supabase
          .from('user_badges')
          .select('badge_id, earned_at')
          .eq('user_id', user.id),
        supabase
          .from('leaderboard_entries')
          .select('*')
          .eq('category', 'overall')
          .order('points', { ascending: false })
          .limit(10)
      ]);

      // Handle user points
      if (pointsResult.data) {
        setUserPoints(pointsResult.data);
      } else {
        // Initialize user points if they don't exist
        const { data: newPoints } = await supabase
          .from('user_points')
          .insert([{ user_id: user.id }])
          .select()
          .maybeSingle();
        if (newPoints) setUserPoints(newPoints);
      }

      // Process badges with earned status
      const earnedIds = new Set(earnedBadgesResult.data?.map((b) => b.badge_id));
      const badgesWithStatus = allBadgesResult.data?.map((badge) => ({
        ...badge,
        earned: earnedIds.has(badge.id),
        earned_at: earnedBadgesResult.data?.find((b) => b.badge_id === badge.id)?.earned_at,
      })) || [];

      setBadges(badgesWithStatus);

      // Process leaderboard with ranks
      const rankedLeaderboard = leaderboardResult.data?.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      })) || [];

      setLeaderboard(rankedLeaderboard);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevelProgress = () => {
    const pointsForNextLevel = userPoints.level * 100;
    const pointsInCurrentLevel = userPoints.total_points % 100;
    return (pointsInCurrentLevel / pointsForNextLevel) * 100;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading rewards...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-8 h-8 text-primary" />
          Rewards & Achievements
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your progress and compete with other students
        </p>
      </div>

      {/* User Stats */}
      <Card className="p-6 mb-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-3xl font-bold">{userPoints.total_points}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Level</p>
              <p className="text-3xl font-bold">{userPoints.level}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
              <p className="text-3xl font-bold">
                {badges.filter((b) => b.earned).length}/{badges.length}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Level Progress</p>
            <p className="text-sm font-medium">
              {userPoints.total_points % 100} / {userPoints.level * 100} XP
            </p>
          </div>
          <Progress value={calculateLevelProgress()} className="h-3" />
        </div>
      </Card>

      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <Card
                key={badge.id}
                className={`p-6 ${
                  badge.earned ? 'border-primary bg-primary/5' : 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{badge.name}</h3>
                      {badge.earned && (
                        <Badge variant="secondary" className="text-xs">
                          Earned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {badge.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        {badge.points_required} points
                      </span>
                    </div>
                    {badge.earned && badge.earned_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Earned on {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <div className="divide-y">
              {leaderboard.map((entry) => (
                <div key={entry.user_id} className="p-4 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1
                        ? 'bg-yellow-500 text-white'
                        : entry.rank === 2
                        ? 'bg-gray-400 text-white'
                        : entry.rank === 3
                        ? 'bg-orange-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{entry.user_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="font-bold">{entry.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
