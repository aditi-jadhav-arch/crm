import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { Company } from "../types";

export const companiesService = {
  async createCompany(companyData: Omit<Company, 'id' | 'owner' | 'createdAt' | 'updatedAt'>, ownerUid: string): Promise<string> {
    const companiesRef = collection(db, "companies");
    const docRef = await addDoc(companiesRef, {
      ...companyData,
      owner: ownerUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // Update the ID
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  },

  async updateCompany(id: string, companyData: Partial<Company>): Promise<void> {
    const docRef = doc(db, "companies", id);
    await updateDoc(docRef, {
      ...companyData,
      updatedAt: serverTimestamp(),
    });

    // If company name was updated, we should update denormalized company name in contacts and deals.
    // We can do this asynchronously/background, or inline. Let's do it in the background if name changed.
    if (companyData.name) {
      try {
        const name = companyData.name;
        // Update contacts denormalized companyName
        const contactsQuery = query(collection(db, "contacts"), where("companyId", "==", id));
        const contactsSnap = await getDocs(contactsQuery);
        contactsSnap.forEach(async (cDoc) => {
          await updateDoc(doc(db, "contacts", cDoc.id), { companyName: name });
        });

        // Update deals denormalized companyName
        const dealsQuery = query(collection(db, "deals"), where("companyId", "==", id));
        const dealsSnap = await getDocs(dealsQuery);
        dealsSnap.forEach(async (dDoc) => {
          await updateDoc(doc(db, "deals", dDoc.id), { companyName: name });
        });
      } catch (err) {
        console.error("Error updating denormalized company names:", err);
      }
    }
  },

  async deleteCompany(id: string): Promise<void> {
    const docRef = doc(db, "companies", id);
    await deleteDoc(docRef);
  },

  async getCompanyById(id: string): Promise<Company | null> {
    const docRef = doc(db, "companies", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as Company;
  }
};
export default companiesService;
