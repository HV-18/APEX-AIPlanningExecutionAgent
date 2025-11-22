import { useState, useEffect } from "react";
import { User, Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileEditorProps {
  profile: {
    full_name: string;
    avatar_url?: string;
    bio?: string;
    study_goals?: string[];
    preferred_subjects?: string[];
  };
  userId: string;
  onUpdate: () => void;
}

export const ProfileEditor = ({ profile, userId, onUpdate }: ProfileEditorProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    bio: profile.bio || "",
    study_goals: profile.study_goals?.join(", ") || "",
    preferred_subjects: profile.preferred_subjects?.join(", ") || "",
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast({ title: "Avatar updated successfully!" });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          study_goals: formData.study_goals
            .split(",")
            .map((g) => g.trim())
            .filter((g) => g),
          preferred_subjects: formData.preferred_subjects
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
        })
        .eq("id", userId);

      if (error) throw error;

      toast({ title: "Profile updated successfully!" });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>
              <User className="w-12 h-12" />
            </AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload Avatar"}
              </div>
            </Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG or WebP (max 2MB)
            </p>
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            placeholder="Enter your full name"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell others about yourself..."
            rows={3}
          />
        </div>

        {/* Study Goals */}
        <div className="space-y-2">
          <Label htmlFor="study_goals">Study Goals</Label>
          <Input
            id="study_goals"
            value={formData.study_goals}
            onChange={(e) =>
              setFormData({ ...formData, study_goals: e.target.value })
            }
            placeholder="e.g., Pass exams, Learn programming, Improve grades"
          />
          <p className="text-xs text-muted-foreground">
            Separate multiple goals with commas
          </p>
        </div>

        {/* Preferred Subjects */}
        <div className="space-y-2">
          <Label htmlFor="preferred_subjects">Preferred Subjects</Label>
          <Input
            id="preferred_subjects"
            value={formData.preferred_subjects}
            onChange={(e) =>
              setFormData({ ...formData, preferred_subjects: e.target.value })
            }
            placeholder="e.g., Mathematics, Physics, Computer Science"
          />
          <p className="text-xs text-muted-foreground">
            Separate multiple subjects with commas
          </p>
        </div>

        {/* Preview Tags */}
        {(formData.study_goals || formData.preferred_subjects) && (
          <div className="space-y-2">
            {formData.study_goals && (
              <div>
                <p className="text-sm font-medium mb-2">Goals Preview:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.study_goals
                    .split(",")
                    .map((goal) => goal.trim())
                    .filter((goal) => goal)
                    .map((goal, i) => (
                      <Badge key={i} variant="secondary">
                        {goal}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
            {formData.preferred_subjects && (
              <div>
                <p className="text-sm font-medium mb-2">Subjects Preview:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.preferred_subjects
                    .split(",")
                    .map((subject) => subject.trim())
                    .filter((subject) => subject)
                    .map((subject, i) => (
                      <Badge key={i} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={handleSave} 
          disabled={saving} 
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Press Ctrl+S to save quickly
        </p>
      </CardContent>
    </Card>
  );
};
