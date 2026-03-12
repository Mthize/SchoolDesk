import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, FileText, Clock, Users, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useNavigate } from "react-router";
import type { exam } from "@/types";
import { toast } from "sonner";
import ExamGenerator from "@/components/lms/ExamGenerator";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

const Exams = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const [exams, setExams] = useState<exam[]>([]);
  const [isGenOpen, setIsGenOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // fetch exams
  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/exams");
      setExams(data);
      setLoading(false);
    } catch (error) {
      toast.error("failed to load exams");
      console.log(error);
      setLoading(false);
      setError("Unable to load exams");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const date = new Date();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes & Exams</h1>
          <p className="text-muted-foreground">
            Manage assessments and view results.
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => setIsGenOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New AI Quiz
          </Button>
        )}
      </div>
      {!loading && error && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Couldn&apos;t load exams</EmptyTitle>
            <EmptyDescription>
              Please refresh to try again. If the issue continues ask an admin
              to verify the connection.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={fetchExams}>
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </EmptyContent>
        </Empty>
      )}
      {!loading && !error && exams.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No exams yet</EmptyTitle>
            <EmptyDescription>
              {isTeacher
                ? "Launch an AI-generated quiz to get started."
                : "Your teachers haven&apos;t published any exams for your class yet."}
            </EmptyDescription>
          </EmptyHeader>
          {isTeacher && (
            <EmptyContent>
              <Button onClick={() => setIsGenOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New AI Quiz
              </Button>
              <Button variant="outline" onClick={fetchExams}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </EmptyContent>
          )}
        </Empty>
      )}
      {(loading || exams.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <Card className="hover:shadow-md transition-shadow" key={exam._id}>
              <CardHeader>
                <div className="pb-2">
                  <Badge>
                    {exam.isActive || new Date(exam.dueDate) < date
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(exam.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="mt-2 text-lg">{exam.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {exam.subject.name}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {exam.class.name}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {exam.duration} mins
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/lms/exams/${exam._id}`)}
                >
                  {isTeacher ? "Manage Questions" : "Start Quiz"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <ExamGenerator
        open={isGenOpen}
        onOpenChange={setIsGenOpen}
        onSuccess={fetchExams}
      />
    </div>
  );
};

export default Exams;
