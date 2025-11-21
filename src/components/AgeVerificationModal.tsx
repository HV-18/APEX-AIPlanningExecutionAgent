import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";
import { z } from "zod";

const ageVerificationSchema = z.object({
  dateOfBirth: z.string().refine((date) => {
    const dob = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      return age - 1 >= 13;
    }
    return age >= 13;
  }, {
    message: "You must be at least 13 years old to use this platform",
  }),
});

interface AgeVerificationModalProps {
  open: boolean;
  onClose: () => void;
}

export const AgeVerificationModal = ({ open, onClose }: AgeVerificationModalProps) => {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    try {
      setLoading(true);

      // Validate age
      const validation = ageVerificationSchema.safeParse({ dateOfBirth });
      
      if (!validation.success) {
        toast({
          title: "Age Verification Failed",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Update profile with age verification
      const { error } = await supabase
        .from("profiles")
        .update({
          age_verified: true,
          date_of_birth: dateOfBirth,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Age Verified",
        description: "Thank you for verifying your age!",
      });

      onClose();
    } catch (error) {
      console.error("Age verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Age Verification Required
          </DialogTitle>
          <DialogDescription>
            To comply with educational platform regulations, we need to verify that you are at least 13 years old. Your information is kept private and secure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 13 years old
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleVerify}
              disabled={!dateOfBirth || loading}
              className="flex-1"
            >
              {loading ? "Verifying..." : "Verify Age"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree that the information provided is accurate.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};