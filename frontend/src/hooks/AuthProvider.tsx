import { createContext, useState, useEffect, useContext } from "react";
import { api } from "@/lib/api";
import type { academicYear, subject, user } from "@/types";

// 1. Create Context
const AuthContext = createContext<{
  user: user | null;
  setUser: React.Dispatch<React.SetStateAction<user | null>>;
  loading: boolean;
  year: academicYear | null;
  yearStatus: "checking" | "ready" | "missing" | "error";
}>({
  user: null,
  setUser: () => {},
  loading: true,
  year: null,
  yearStatus: "checking",
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<user | null>(null);
  const [loading, setLoading] = useState(true); // <--- Vital for preventing "flicker"
  const [year, setYear] = useState<academicYear | null>(null);
  const [yearStatus, setYearStatus] = useState<
    "checking" | "ready" | "missing" | "error"
  >("checking");
  const [userLoaded, setUserLoaded] = useState(false);
  const [yearLoaded, setYearLoaded] = useState(false);

  const normalizeUser = (rawUser: user & { teacherSubject?: subject[] }): user => {
    const teacherSubjects = rawUser.teacherSubjects ?? rawUser.teacherSubject ?? [];
    return {
      ...rawUser,
      teacherSubjects,
    };
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setUser(normalizeUser(data.user));
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setUserLoaded(true);
      }
    };
    const fetchYear = async () => {
      try {
        const { data } = await api.get("/academic-years/current");
        setYear(data);
        setYearStatus("ready");
      } catch (error) {
        console.log(error);
        setYear(null);
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) {
          setYearStatus("missing");
        } else {
          setYearStatus("error");
        }
      } finally {
        setYearLoaded(true);
      }
    };

    checkAuth();
    fetchYear();
  }, []);

  useEffect(() => {
    if (userLoaded && yearLoaded) {
      setLoading(false);
    }
  }, [userLoaded, yearLoaded]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, year, yearStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
