import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly (email, profile data), usage data (study sessions, notes, quiz results), and device data (browser type, IP address) to provide and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              Your data is used to personalize your learning experience, generate AI-powered recommendations, track your progress, and improve APEX features. We use analytics to understand usage patterns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. Data may be shared with service providers who help us operate APEX (cloud hosting, AI services) under strict confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. AI and Machine Learning</h2>
            <p className="text-muted-foreground">
              APEX uses AI models to analyze your study patterns and provide personalized assistance. Your interactions with AI features help improve model accuracy while maintaining your privacy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures including encryption, secure authentication, and regular security audits to protect your data from unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal data. You can export your data at any time from your profile settings. Contact us to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies for authentication, preferences, and analytics. See our Cookie Preferences page for detailed information and controls.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground">
              APEX is intended for users 13 years and older. We do not knowingly collect data from children under 13. If you believe we have such data, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Policy Changes</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy periodically. Significant changes will be communicated via email or in-app notification.
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
