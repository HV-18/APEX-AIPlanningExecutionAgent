import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsPage = () => {
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

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using APEX, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to use APEX only for lawful educational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. AI Services</h2>
            <p className="text-muted-foreground">
              APEX uses AI technology to provide study assistance, content generation, and personalized recommendations. While we strive for accuracy, AI-generated content should be verified independently for critical academic work.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Usage</h2>
            <p className="text-muted-foreground">
              Your study data, notes, and interactions are used to improve your experience and provide personalized recommendations. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              APEX is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of APEX after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, please contact our support team through the help section in your dashboard.
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

export default TermsPage;
