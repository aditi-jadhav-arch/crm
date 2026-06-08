import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { Contact } from "../types";

export const contactsService = {
  async createContact(contactData: Omit<Contact, 'id' | 'companyName' | 'owner' | 'createdAt' | 'updatedAt'>, ownerUid: string): Promise<string> {
    let companyName = "";
    if (contactData.companyId) {
      const compSnap = await getDoc(doc(db, "companies", contactData.companyId));
      if (compSnap.exists()) {
        companyName = compSnap.data().name || "";
      }
    }

    const contactsRef = collection(db, "contacts");
    const docRef = await addDoc(contactsRef, {
      ...contactData,
      companyName,
      owner: ownerUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  },

  async updateContact(id: string, contactData: Partial<Contact>): Promise<void> {
    const updatePayload: any = { ...contactData, updatedAt: serverTimestamp() };

    // If companyId was updated, fetch and update companyName
    if (contactData.companyId !== undefined) {
      if (contactData.companyId) {
        const compSnap = await getDoc(doc(db, "companies", contactData.companyId));
        updatePayload.companyName = compSnap.exists() ? (compSnap.data().name || "") : "";
      } else {
        updatePayload.companyName = "";
      }
    }

    const docRef = doc(db, "contacts", id);
    await updateDoc(docRef, updatePayload);

    // If contact name was updated, update denormalized contactName in deals
    if (contactData.firstName !== undefined || contactData.lastName !== undefined) {
      try {
        const contactSnap = await getDoc(docRef);
        if (contactSnap.exists()) {
          const contact = contactSnap.data() as Contact;
          const fullName = `${contact.firstName} ${contact.lastName}`.trim();

          const dealsQuery = query(collection(db, "deals"), where("contactId", "==", id));
          const dealsSnap = await getDocs(dealsQuery);
          dealsSnap.forEach(async (dDoc) => {
            await updateDoc(doc(db, "deals", dDoc.id), { contactName: fullName });
          });
        }
      } catch (err) {
        console.error("Error updating denormalized contact names:", err);
      }
    }
  },

  async deleteContact(id: string): Promise<void> {
    const docRef = doc(db, "contacts", id);
    await deleteDoc(docRef);
  },

  async getContactById(id: string): Promise<Contact | null> {
    const docRef = doc(db, "contacts", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as Contact;
  }
};
export default contactsService;
