import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";
import { Deal } from "../types";

export function useDeals(filters?: { stage?: string; contactId?: string; companyId?: string }) {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setDeals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "deals"),
      where("owner", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Deal[] = [];
        snapshot.forEach((doc) => {
          data.push(doc.data() as Deal);
        });

        let filteredData = data;
        if (filters) {
          if (filters.stage) {
            filteredData = filteredData.filter(d => d.stage === filters.stage);
          }
          if (filters.contactId) {
            filteredData = filteredData.filter(d => d.contactId === filters.contactId);
          }
          if (filters.companyId) {
            filteredData = filteredData.filter(d => d.companyId === filters.companyId);
          }
        }

        // Sort by expectedCloseDate or value descending
        filteredData.sort((a, b) => {
          const t1 = a.createdAt?.seconds || 0;
          const t2 = b.createdAt?.seconds || 0;
          return t2 - t1;
        });

        setDeals(filteredData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching deals:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, filters?.stage, filters?.contactId, filters?.companyId]);

  return { deals, loading, error };
}
export default useDeals;
