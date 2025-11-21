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

        <h1 className="text-4xl font-bold mb-2 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">1. Information Collection</h2>
            <p className="text-muted-foreground leading-relaxed">
              APEX collects personal information directly provided by users, including but not limited to: email addresses, profile information, and account credentials. We also collect usage data such as study session records, note content, quiz performance, and learning analytics. Device information including browser type, IP address, and access timestamps is collected for security and service optimization purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">2. Data Processing and Usage</h2>
            <p className="text-muted-foreground leading-relaxed">
              Personal information is processed to deliver personalized learning experiences, generate intelligent recommendations through artificial intelligence, monitor academic progress, and enhance platform functionality. Usage analytics enable us to identify usage patterns and optimize service delivery. All data processing complies with applicable data protection regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">3. Information Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              APEX does not sell or rent personal information to third parties. Data may be disclosed to trusted service providers who assist in platform operations, including cloud infrastructure, AI processing services, and security providers. All third-party service providers are bound by contractual obligations to maintain data confidentiality and implement appropriate security measures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">4. Artificial Intelligence and Machine Learning</h2>
            <p className="text-muted-foreground leading-relaxed">
              The platform employs advanced artificial intelligence models powered by Google Gemini to analyze learning patterns and deliver personalized educational assistance. User interactions with AI features contribute to model refinement and accuracy improvement while maintaining strict privacy protocols. All AI processing is conducted with appropriate data protection safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">5. Security Measures</h2>
            <p className="text-muted-foreground leading-relaxed">
              APEX implements industry-standard security protocols including end-to-end encryption, multi-factor authentication capabilities, and regular security assessments to protect user data from unauthorized access, disclosure, alteration, or destruction. While we employ robust security measures, no method of electronic transmission or storage is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">6. User Rights and Data Control</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users maintain the right to access, modify, or request deletion of their personal information. Data export functionality is available through profile settings, enabling users to download their information in standard formats. To exercise these rights or submit data-related inquiries, contact our support team through the designated channels.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">7. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed">
              The platform utilizes cookies and similar tracking technologies for authentication, user preference storage, and analytics purposes. Detailed information regarding cookie usage and management options is available in our Cookie Preferences documentation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">8. Age Restrictions and Minors</h2>
            <p className="text-muted-foreground leading-relaxed">
              APEX services are intended for users aged 13 years and above. We do not knowingly collect or process personal information from individuals under 13 years of age. If we become aware of inadvertent data collection from minors below the minimum age requirement, immediate steps will be taken to delete such information from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">9. Policy Modifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy may be updated periodically to reflect changes in legal requirements, business practices, or platform functionality. Material modifications will be communicated to users via email notification or prominent in-application notices. Continued platform usage following policy updates constitutes acceptance of the revised terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
