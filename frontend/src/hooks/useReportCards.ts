import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ReportCard, ReportCardFilters, ReportTerm } from "@/types";

interface ReportCardResponse {
  reportCards: ReportCard[];
  filters: ReportCardFilters;
}

export interface ReportCardQueryParams {
  term?: ReportTerm;
  academicYearId?: string;
  latest?: boolean;
}

export const useReportCards = (initialParams?: ReportCardQueryParams) => {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [filters, setFilters] = useState<ReportCardFilters>({
    terms: [],
    academicYears: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialParamsRef = useRef(initialParams);

  const fetchReportCards = useCallback(
    async (params?: ReportCardQueryParams) => {
      try {
        setLoading(true);
        setError(null);

        const normalizedParams = params
          ? Object.fromEntries(
              Object.entries(params).filter(([, value]) =>
                value !== undefined && value !== null
              ),
            )
          : undefined;

        const { data } = await api.get<ReportCardResponse>("/report-cards", {
          params: normalizedParams,
        });

        setReportCards(data.reportCards || []);
        setFilters({
          terms: data.filters?.terms || [],
          academicYears: data.filters?.academicYears || [],
        });
      } catch (error) {
        console.error("Unable to load report cards", error);
        setError("Unable to load report cards");
        toast.error("Unable to load report cards", {
          description: "Please try again in a moment.",
        });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchReportCards(initialParamsRef.current);
  }, [fetchReportCards]);

  return {
    reportCards,
    filters,
    loading,
    error,
    refetch: fetchReportCards,
  };
};
