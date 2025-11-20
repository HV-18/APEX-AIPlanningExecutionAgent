import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BookOpen, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BackButton } from "@/components/BackButton";

interface Question {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

const QuizPage = () => {
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [weakAreas, setWeakAreas] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const generateQuiz = async () => {
    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter a subject for the quiz",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          subject,
          difficulty,
          weakAreas: weakAreas ? weakAreas.split(',').map(s => s.trim()) : []
        }
      });

      if (error) throw error;

      if (data?.questions) {
        setQuestions(data.questions);
        setCurrentQuestion(0);
        setUserAnswers({});
        setShowResults(false);
        toast({
          title: "Quiz generated!",
          description: `${data.questions.length} questions ready`,
        });
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate quiz",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setUserAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_answer) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    setSubject("");
    setWeakAreas("");
  };

  const quizGeneratorSection = (
    <Card className="p-6 space-y-6 sticky top-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Generate Quiz</h2>
        <p className="text-sm text-muted-foreground">
          Create a personalized quiz on any subject
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="e.g., Python Programming, World History, Biology"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger id="difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="weakAreas">Focus Areas (Optional)</Label>
          <Input
            id="weakAreas"
            placeholder="e.g., loops, functions, data structures (comma-separated)"
            value={weakAreas}
            onChange={(e) => setWeakAreas(e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Add topics you want to focus on, separated by commas
          </p>
        </div>
      </div>

      <Button 
        onClick={generateQuiz} 
        disabled={isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Quiz...
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4 mr-2" />
            Generate Quiz
          </>
        )}
      </Button>

      {questions.length > 0 && (
        <Button
          onClick={resetQuiz}
          variant="outline"
          className="w-full"
        >
          Create New Quiz
        </Button>
      )}
    </Card>
  );

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <BackButton to="/dashboard" />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            AI Quiz Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate personalized quizzes on any subject
          </p>
        </div>

        {quizGeneratorSection}
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="space-y-6">
        <BackButton to="/dashboard" />
        <div>
          <h1 className="text-3xl font-bold">Quiz Results</h1>
          <p className="text-muted-foreground mt-1">
            Here's how you performed on {subject}
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-primary">
              {score.percentage}%
            </div>
            <div className="text-xl">
              {score.correct} out of {score.total} correct
            </div>
            <Progress value={score.percentage} className="w-full" />
          </div>

          <div className="space-y-4 mt-8">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[idx];
              const isCorrect = userAnswer === q.correct_answer;
              
              return (
                <Card key={idx} className="p-4">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1 space-y-2">
                      <p className="font-medium">Q{idx + 1}. {q.question}</p>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Your answer: </span>
                          <Badge variant={isCorrect ? "default" : "destructive"}>
                            {userAnswer ? `${userAnswer}: ${q.options[userAnswer as keyof typeof q.options]}` : 'Not answered'}
                          </Badge>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm">
                            <span className="font-medium">Correct answer: </span>
                            <Badge variant="default">
                              {q.correct_answer}: {q.options[q.correct_answer]}
                            </Badge>
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          <span className="font-medium">Explanation: </span>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-4">
            <Button onClick={resetQuiz} variant="outline" className="flex-1">
              Generate New Quiz
            </Button>
            <Button onClick={() => setShowResults(false)} className="flex-1">
              Review Answers
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      <BackButton to="/dashboard" />
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-8 h-8" />
          AI Quiz - {subject}
        </h1>
        <p className="text-muted-foreground mt-1">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Section */}
        <div className="lg:col-span-1">
          {quizGeneratorSection}
        </div>

        {/* Quiz Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-6">
            <Progress value={progress} className="h-2" />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{currentQ.question}</h2>

              <div className="space-y-3">
                {Object.entries(currentQ.options).map(([key, value]) => (
                  <Button
                    key={key}
                    variant={userAnswers[currentQuestion] === key ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-4 px-6"
                    onClick={() => handleAnswer(key)}
                  >
                    <span className="font-bold mr-3">{key}.</span>
                    <span>{value}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestion === questions.length - 1 ? (
                  <Button onClick={submitQuiz} disabled={Object.keys(userAnswers).length !== questions.length}>
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={nextQuestion}>
                    Next
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/50">
            <h4 className="font-semibold mb-3">Question Navigation</h4>
            <div className="flex gap-2 flex-wrap">
              {questions.map((_, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant={idx === currentQuestion ? "default" : userAnswers[idx] ? "secondary" : "outline"}
                  onClick={() => setCurrentQuestion(idx)}
                  className="w-10 h-10"
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
