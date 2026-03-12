import { useEffect, useMemo, useState } from "react";
import { Award, Printer, RefreshCcw } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useReportCards } from "@/hooks/useReportCards";
import type { ReportCard, ReportTerm } from "@/types";
import { cn } from "@/lib/utils";
import { achievementLevels, formatTermLabel } from "@/lib/reporting";
import { ReportCardEmptyState } from "./report-card-empty-state";

const promotionTone: Record<ReportCard["promotionStatus"], string> = {
  promoted: "bg-emerald-500/10 text-emerald-600 border-emerald-500/40",
  conditional: "bg-amber-500/10 text-amber-600 border-amber-500/40",
  not_promoted: "bg-red-500/10 text-red-500 border-red-500/40",
};

const levelTone: Record<number, string> = {
  7: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  6: "bg-green-500/10 text-green-600 border-green-500/30",
  5: "bg-teal-500/10 text-teal-600 border-teal-500/30",
  4: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  3: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  2: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  1: "bg-red-500/10 text-red-600 border-red-500/30",
};

const formatPercentage = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "–";
  }
  return `${value.toFixed(1)}%`;
};

const formatMark = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return "–";
  }
  return `${Math.round(value)}%`;
};

const AchievementLegend = () => (
  <div className="rounded-xl border bg-muted/30 p-4">
    <div className="mb-3 flex items-center gap-2 text-sm font-medium">
      <Award className="h-4 w-4" />
      South African Achievement Levels
    </div>
    <div className="space-y-2 text-xs">
      {achievementLevels.map((level) => (
        <div
          key={level.level}
          className="flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <Badge className={cn("text-[10px]", level.tone)}>
              Level {level.level}
            </Badge>
            <span>{level.label}</span>
          </div>
          <span className="text-muted-foreground">{level.range}</span>
        </div>
      ))}
    </div>
  </div>
);

const RemarksPanel = ({ card }: { card: ReportCard }) => (
  <div className="rounded-xl border bg-card p-4 space-y-3">
    <div className="text-sm font-medium">Remarks</div>
    <div>
      <p className="text-xs text-muted-foreground">Class Teacher</p>
      <p className="text-sm font-medium">
        {card.classTeacherRemark || "No remark captured yet."}
      </p>
    </div>
    <Separator />
    <div>
      <p className="text-xs text-muted-foreground">Principal</p>
      <p className="text-sm font-medium">
        {card.principalRemark || "Principal remark pending."}
      </p>
    </div>
    <Separator />
    <div>
      <p className="text-xs text-muted-foreground">General Comment</p>
      <p className="text-sm font-medium">
        {card.generalComment || "Teachers are finalising their comments."}
      </p>
    </div>
  </div>
);

const SubjectsTable = ({ card }: { card: ReportCard }) => {
  if (!card.subjects.length) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Teachers are still loading marks for this term.
      </div>
    );
  }

  const sortedSubjects = [...card.subjects].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead className="text-center">Coursework</TableHead>
            <TableHead className="text-center">Exam</TableHead>
            <TableHead className="text-center">Final %</TableHead>
            <TableHead>Achievement</TableHead>
            <TableHead>Teacher Comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSubjects.map((subject) => {
            return (
              <TableRow key={subject.subjectId || subject.name}>
                <TableCell className="font-medium">
                  <div>{subject.name}</div>
                  {subject.code && (
                    <p className="text-xs text-muted-foreground">
                      {subject.code}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {formatMark(subject.courseworkMark)}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {formatMark(subject.examMark)}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {formatPercentage(subject.finalPercentage ?? subject.percentage)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "text-xs",
                      levelTone[subject.achievementLevel ?? 0] ?? "bg-muted",
                    )}
                  >
                    {subject.achievementLevel
                      ? `Level ${subject.achievementLevel}`
                      : "Pending"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {subject.achievementLabel || subject.achievementDescriptor ||
                      "Awaiting"}
                  </p>
                  {subject.assessedBy?.name && (
                    <p className="text-xs text-muted-foreground">
                      by {subject.assessedBy.name}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {subject.teacherComment || "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export function ReportCardWidget() {
  const { reportCards, filters, loading, error, refetch } = useReportCards({
    latest: true,
  });
  const [selectedTerm, setSelectedTerm] = useState<ReportTerm | undefined>();
  const [selectedYear, setSelectedYear] = useState<string | undefined>();

  const activeCard = useMemo(() => reportCards[0], [reportCards]);

  useEffect(() => {
    if (activeCard?.academicYear?.id) {
      setSelectedYear((prev) => prev ?? activeCard.academicYear?.id);
    }
    if (activeCard?.term) {
      setSelectedTerm((prev) => prev ?? activeCard.term);
    }
  }, [activeCard]);

  const selectedContextLabel = useMemo(() => {
    const termLabel = selectedTerm ? formatTermLabel(selectedTerm) : undefined;
    const yearLabel = selectedYear
      ? filters.academicYears.find((year) => year.id === selectedYear)?.name
      : undefined;
    if (termLabel && yearLabel) {
      return `${termLabel} - ${yearLabel}`;
    }
    return termLabel ?? yearLabel;
  }, [selectedTerm, selectedYear, filters.academicYears]);

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    refetch({ academicYearId: value, term: selectedTerm });
  };

  const handleTermChange = (value: ReportTerm) => {
    setSelectedTerm(value);
    refetch({ academicYearId: selectedYear, term: value });
  };

  const handleRefresh = () => {
    if (selectedYear || selectedTerm) {
      refetch({ academicYearId: selectedYear, term: selectedTerm });
    } else {
      refetch({ latest: true });
    }
  };

  const handlePrint = () => window.print();

  const renderSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid gap-4 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-48" />
        <Skeleton className="lg:col-span-3 h-48" />
      </div>
    </div>
  );

  const renderSummary = (card: ReportCard) => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border bg-muted/30 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Overall Average
        </p>
        <p className="text-3xl font-semibold">
          {formatPercentage(card.overallAverage ?? card.overallPercentage)}
        </p>
        <p className="text-sm text-muted-foreground">
          {card.overallDescriptor || "Awaiting moderation"}
        </p>
      </div>
      <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Promotion Status
        </div>
        <Badge className={cn("w-fit", promotionTone[card.promotionStatus])}>
          {card.promotionStatus.replace("_", " ")}
        </Badge>
        <div className="text-xs text-muted-foreground">
          Published on {card.publishedAt
            ? new Date(card.publishedAt).toLocaleDateString()
            : "Pending release"}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="print:bg-white">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Report Card</CardTitle>
          <CardDescription>
            Detailed performance summary for the academic year.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <Select
            value={selectedYear ?? ""}
            onValueChange={handleYearChange}
            disabled={!filters.academicYears.length}
          >
            <SelectTrigger size="sm" className="min-w-40">
              <SelectValue placeholder="Academic year" />
            </SelectTrigger>
            <SelectContent>
              {filters.academicYears.map((year) => (
                <SelectItem key={year.id} value={year.id ?? ""}>
                  {year.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedTerm ?? ""}
            onValueChange={handleTermChange}
            disabled={!filters.terms.length}
          >
            <SelectTrigger size="sm" className="min-w-32">
              <SelectValue placeholder="Term" />
            </SelectTrigger>
            <SelectContent>
              {filters.terms.map((term) => (
                <SelectItem key={term.value} value={term.value}>
                  {term.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={handleRefresh}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="print:hidden"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Unable to load report cards</AlertTitle>
            <AlertDescription>
              Please check your connection and try again in a moment.
            </AlertDescription>
          </Alert>
        )}
        {loading && renderSkeleton()}
        {!loading && !activeCard && (
          <ReportCardEmptyState
            onRefresh={handleRefresh}
            contextLabel={selectedContextLabel}
          />
        )}
        {!loading && activeCard && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
              <span>
                {activeCard.class?.name || "Class unassigned"} •
                {" "}
                {activeCard.academicYear?.name || "Academic year TBD"}
              </span>
              <span>
                {formatTermLabel(activeCard.term, activeCard.termLabel)} •
                {" "}
                {activeCard.isFinal ? "Finalised" : "Provisional"}
              </span>
            </div>
            {renderSummary(activeCard)}
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <SubjectsTable card={activeCard} />
              </div>
              <div className="space-y-4 lg:col-span-2">
                <AchievementLegend />
                <RemarksPanel card={activeCard} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
