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
import { Activity } from "../types";

export const activitiesService = {
  async createActivity(activityData: Omit<Activity, 'id' | 'contactName' | 'dealTitle' | 'owner' | 'createdAt'>, ownerUid: string): Promise<string> {
    let contactName = "";
    if (activityData.contactId) {
      const contactSnap = await getDoc(doc(db, "contacts", activityData.contactId));
      if (contactSnap.exists()) {
        const contact = contactSnap.data();
        contactName = `${contact.firstName} ${contact.lastName}`.trim();
      }
    }

    let dealTitle = "";
    if (activityData.dealId) {
      const dealSnap = await getDoc(doc(db, "deals", activityData.dealId));
      if (dealSnap.exists()) {
        dealTitle = dealSnap.data().title || "";
      }
    }

    const activitiesRef = collection(db, "activities");
    const payload: any = {
      ...activityData,
      contactName,
      dealTitle,
      owner: ownerUid,
      createdAt: serverTimestamp(),
    };

    if (activityData.dueDate) {
      payload.dueDate = activityData.dueDate;
    }

    if (activityData.isCompleted) {
      payload.completedAt = serverTimestamp();
    }

    const docRef = await addDoc(activitiesRef, payload);
    await updateDoc(docRef, { id: docRef.id });

    // Update the contact's lastContactedAt if type is call/email/meeting
    if (activityData.contactId && ["call", "email", "meeting"].includes(activityData.type)) {
      try {
        await updateDoc(doc(db, "contacts", activityData.contactId), {
          lastContactedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Error updating contact last contacted time:", err);
      }
    }

    return docRef.id;
  },

  async updateActivity(id: string, activityData: Partial<Activity>): Promise<void> {
    const updatePayload: any = { ...activityData };

    if (activityData.contactId !== undefined) {
      if (activityData.contactId) {
        const contactSnap = await getDoc(doc(db, "contacts", activityData.contactId));
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

    if (activityData.dealId !== undefined) {
      if (activityData.dealId) {
        const dealSnap = await getDoc(doc(db, "deals", activityData.dealId));
        updatePayload.dealTitle = dealSnap.exists() ? (dealSnap.data().title || "") : "";
      } else {
        updatePayload.dealTitle = "";
      }
    }

    if (activityData.isCompleted !== undefined) {
      updatePayload.completedAt = activityData.isCompleted ? serverTimestamp() : null;
    }

    const docRef = doc(db, "activities", id);
    await updateDoc(docRef, updatePayload);
  },

  async deleteActivity(id: string): Promise<void> {
    const docRef = doc(db, "activities", id);
    await deleteDoc(docRef);
  },

  async toggleActivityCompleted(id: string, isCompleted: boolean): Promise<void> {
    const docRef = doc(db, "activities", id);
    await updateDoc(docRef, {
      isCompleted,
      completedAt: isCompleted ? serverTimestamp() : null
    });
  }
};
export default activitiesService;
