import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { Deal } from "../types";

export const dealsService = {
  async createDeal(dealData: Omit<Deal, 'id' | 'contactName' | 'companyName' | 'owner' | 'createdAt' | 'updatedAt' | 'actualCloseDate'>, ownerUid: string): Promise<string> {
    let contactName = "";
    if (dealData.contactId) {
      const contactSnap = await getDoc(doc(db, "contacts", dealData.contactId));
      if (contactSnap.exists()) {
        const contact = contactSnap.data();
        contactName = `${contact.firstName} ${contact.lastName}`.trim();
      }
    }

    let companyName = "";
    if (dealData.companyId) {
      const compSnap = await getDoc(doc(db, "companies", dealData.companyId));
      if (compSnap.exists()) {
        companyName = compSnap.data().name || "";
      }
    }

    const dealsRef = collection(db, "deals");
    const payload: any = {
      ...dealData,
      contactName,
      companyName,
      owner: ownerUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (dealData.stage === "closed_won" || dealData.stage === "closed_lost") {
      payload.actualCloseDate = serverTimestamp();
    }

    const docRef = await addDoc(dealsRef, payload);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  },

  async updateDeal(id: string, dealData: Partial<Deal>): Promise<void> {
    const updatePayload: any = { ...dealData, updatedAt: serverTimestamp() };

    if (dealData.contactId !== undefined) {
      if (dealData.contactId) {
        const contactSnap = await getDoc(doc(db, "contacts", dealData.contactId));
        if (contactSnap.exists()) {
          const contact = contactSnap.data();
          updatePayload.contactName = `${contact.firstName} ${contact.lastName}`.trim();
        } else {
          updatePayload.contactName = "";
        }
      } else {
        updatePayload.contactName = "";
      }
    }

    if (dealData.companyId !== undefined) {
      if (dealData.companyId) {
        const compSnap = await getDoc(doc(db, "companies", dealData.companyId));
        updatePayload.companyName = compSnap.exists() ? (compSnap.data().name || "") : "";
      } else {
        updatePayload.companyName = "";
      }
    }

    if (dealData.stage !== undefined) {
      if (dealData.stage === "closed_won" || dealData.stage === "closed_lost") {
        updatePayload.actualCloseDate = serverTimestamp();
      } else {
        updatePayload.actualCloseDate = null; // reset if moved back
      }
    }

    const docRef = doc(db, "deals", id);
    await updateDoc(docRef, updatePayload);
  },

  async deleteDeal(id: string): Promise<void> {
    const docRef = doc(db, "deals", id);
    await deleteDoc(docRef);
  },

  async getDealById(id: string): Promise<Deal | null> {
    const docRef = doc(db, "deals", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as Deal;
  }
};
export default dealsService;
