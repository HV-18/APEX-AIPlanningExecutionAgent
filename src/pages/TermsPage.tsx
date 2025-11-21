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

        <h1 className="text-4xl font-bold mb-2 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or utilizing APEX services, users acknowledge and agree to be legally bound by these Terms of Service. If you do not accept these terms in their entirety, you must immediately discontinue use of all platform services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">2. User Obligations and Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users are solely responsible for maintaining the confidentiality and security of account credentials. All activities conducted under user accounts are the user's responsibility. Platform services must be utilized exclusively for lawful educational purposes in compliance with applicable local, state, and federal regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">3. Artificial Intelligence Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              APEX provides artificial intelligence-powered educational assistance, content generation, and personalized recommendation services. While we maintain high accuracy standards, AI-generated content should be independently verified for critical academic applications. Users acknowledge that AI outputs may contain inaccuracies and should not be solely relied upon for assessment or examination purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">4. Data Usage and Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              User study data, notes, and platform interactions are processed to enhance user experience and provide personalized recommendations. Personal data is not sold or transferred to third parties for marketing purposes. Comprehensive data handling practices are detailed in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">5. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              APEX services are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We disclaim all warranties regarding accuracy, reliability, or fitness for particular purposes. In no event shall APEX be liable for indirect, incidental, consequential, or punitive damages arising from platform usage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">6. Terms Modification</h2>
            <p className="text-muted-foreground leading-relaxed">
              APEX reserves the right to modify, amend, or update these Terms of Service at any time without prior notice. Continued platform usage following term modifications constitutes acceptance of the revised agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">7. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For inquiries regarding these Terms of Service, please contact our support team through the designated support channels accessible via your user dashboard.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
