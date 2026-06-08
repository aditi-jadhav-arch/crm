import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";
import { Company } from "../types";

export function useCompanies(filters?: { industry?: string; size?: string }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setCompanies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "companies"),
      where("owner", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Company[] = [];
        snapshot.forEach((doc) => {
          data.push(doc.data() as Company);
        });

        let filteredData = data;
        if (filters) {
          if (filters.industry) {
            filteredData = filteredData.filter(c => c.industry === filters.industry);
          }
          if (filters.size) {
            filteredData = filteredData.filter(c => c.size === filters.size);
          }
        }

        // Sort by name alphabetically
        filteredData.sort((a, b) => a.name.localeCompare(b.name));

        setCompanies(filteredData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching companies:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, filters?.industry, filters?.size]);

  return { companies, loading, error };
}
export default useCompanies;
