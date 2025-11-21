import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Brain, Target, Lightbulb, Sparkles, Users, Heart, Cpu } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      <BackButton to="/dashboard" />
      
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          APEX: AI Planning & Execution Agent
        </h1>
        <p className="text-lg text-muted-foreground">
          Enterprise-grade AI-powered educational platform
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To revolutionize educational technology by delivering comprehensive AI-powered learning solutions integrated with student wellness capabilities, enabling academic excellence while supporting holistic personal development.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-accent" />
              </div>
              <CardTitle>Strategic Vision</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To establish APEX as the premier AI-driven educational platform, providing universal access to personalized intelligent tutoring, real-time collaborative learning environments, and comprehensive wellness management systems.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>What We Do</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p><strong>Market Challenge:</strong> Students navigate complex academic demands while managing mental health, nutritional requirements, and career preparation. Existing solutions address individual aspects without comprehensive integration.</p>
          <p><strong>APEX Solution:</strong> Industry-first platform combining advanced AI educational technology with integrated wellness monitoring, delivering personalized learning pathways, collaborative environments, behavioral analytics, nutritional assessment, and sustainability initiatives.</p>
          <p><strong>Measurable Impact:</strong> Enhanced academic performance metrics, reduced stress indicators, improved health outcomes, and strengthened career readiness through unified student support infrastructure.</p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-primary">AI Technology Powered by Google Gemini</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            APEX leverages <strong className="text-primary">Google Gemini 2.5</strong>, representing state-of-the-art artificial intelligence technology, to power comprehensive intelligent capabilities across the platform infrastructure.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1 tracking-tight">Conversational AI Interface</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Advanced natural language processing for academic inquiry resolution, interview preparation, and examination coaching utilizing Gemini 2.5 Flash with real-time streaming capabilities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="w-3 h-3 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1 tracking-tight">Adaptive Learning Analytics</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Intelligent analysis of learning patterns generating customized study methodologies and recommendations calibrated to individual performance metrics.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Target className="w-3 h-3 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1 tracking-tight">Dynamic Assessment Generation</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AI-powered adaptive quiz creation based on subject domains and identified knowledge gaps for targeted skill development.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1 tracking-tight">Visual Content Synthesis</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gemini 2.5 Flash Image model generates educational diagrams, visual learning aids, and instructional illustrations from text specifications.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-background/50 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground">
              <strong className="text-primary">Model:</strong> google/gemini-2.5-flash (Chat & Analysis), 
              google/gemini-2.5-flash-image-preview (Image Generation)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <CardTitle>Core Values</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">Education Excellence</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">AI-driven personalized learning pathways and collaborative educational tools</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-destructive" />
              </div>
              <h4 className="font-semibold">Comprehensive Wellness</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">Integrated mental health support, nutritional guidance, and stress management</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-semibold">Collaborative Learning</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">Real-time study environments and peer support networks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>What Makes Us Different</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-semibold">1</span>
              </div>
              <p><strong>Intelligent Personalization:</strong> Adaptive learning algorithms and data-driven recommendation engines</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-accent font-semibold">2</span>
              </div>
              <p><strong>Synchronous Collaboration:</strong> Live study environments featuring video conferencing, shared whiteboards, and integrated development tools</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-semibold">3</span>
              </div>
              <p><strong>Wellness Integration:</strong> Behavioral analysis, nutritional assessment, and comprehensive wellness reporting</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-accent font-semibold">4</span>
              </div>
              <p><strong>Sustainability Framework:</strong> Environmental consciousness features preparing students for responsible global citizenship</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage;