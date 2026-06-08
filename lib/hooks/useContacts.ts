import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";
import { Contact } from "../types";

export function useContacts(filters?: { status?: string; source?: string; tag?: string }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "contacts"),
      where("owner", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Contact[] = [];
        snapshot.forEach((doc) => {
          data.push(doc.data() as Contact);
        });

        let filteredData = data;
        if (filters) {
          if (filters.status) {
            filteredData = filteredData.filter(c => c.status === filters.status);
          }
          if (filters.source) {
            filteredData = filteredData.filter(c => c.source === filters.source);
          }
          if (filters.tag) {
            filteredData = filteredData.filter(c => c.tags?.includes(filters.tag!));
          }
        }

        // Default sort by createdAt descending
        filteredData.sort((a, b) => {
          const t1 = a.createdAt?.seconds || 0;
          const t2 = b.createdAt?.seconds || 0;
          return t2 - t1;
        });

        setContacts(filteredData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching contacts:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, filters?.status, filters?.source, filters?.tag]);

  return { contacts, loading, error };
}
export default useContacts;
