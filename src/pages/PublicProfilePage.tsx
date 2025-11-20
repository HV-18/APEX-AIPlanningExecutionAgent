import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { User, BookOpen, Trophy, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface PublicProfile {
  full_name: string;
  avatar_url: string;
  bio: string;
  study_goals: string[];
  preferred_subjects: string[];
}

const PublicProfilePage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicProfile();
  }, [userId]);

  const loadPublicProfile = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bio, study_goals, preferred_subjects")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error loading public profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">This user profile doesn't exist or is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>
                <User className="w-16 h-16" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-3xl font-bold">{profile.full_name}</h1>
              {profile.bio && (
                <p className="text-muted-foreground mt-2 max-w-2xl">{profile.bio}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary">
                <Trophy className="w-3 h-3 mr-1" />
                Study Partner
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {profile.study_goals && profile.study_goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Study Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.study_goals.map((goal, i) => (
                <Badge key={i} variant="secondary">
                  {goal}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {profile.preferred_subjects && profile.preferred_subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Preferred Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.preferred_subjects.map((subject, i) => (
                <Badge key={i} variant="outline">
                  {subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicProfilePage;
