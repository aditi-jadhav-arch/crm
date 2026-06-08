import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";
import { Activity } from "../types";

export function useActivities(filters?: { contactId?: string; dealId?: string; companyId?: string }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "activities"),
      where("owner", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Activity[] = [];
        snapshot.forEach((doc) => {
          data.push(doc.data() as Activity);
        });

        let filteredData = data;
        if (filters) {
          if (filters.contactId) {
            filteredData = filteredData.filter(a => a.contactId === filters.contactId);
          }
          if (filters.dealId) {
            filteredData = filteredData.filter(a => a.dealId === filters.dealId);
          }
          if (filters.companyId) {
            filteredData = filteredData.filter(a => a.companyId === filters.companyId);
          }
        }

        // Sort by createdAt descending
        filteredData.sort((a, b) => {
          const t1 = a.createdAt?.seconds || 0;
          const t2 = b.createdAt?.seconds || 0;
          return t2 - t1;
        });

        setActivities(filteredData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching activities:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, filters?.contactId, filters?.dealId, filters?.companyId]);

  return { activities, loading, error };
}
export default useActivities;
