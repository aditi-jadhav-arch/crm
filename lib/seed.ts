import { collection, doc, writeBatch, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function seedFirestore(ownerId: string) {
  const batch = writeBatch(db);

  // 1. Create 3 Companies
  const companiesData = [
    {
      name: "Acme Corp",
      industry: "Software & Technology",
      website: "https://acme.com",
      phone: "+1-555-0199",
      email: "info@acme.com",
      size: "enterprise" as const,
      revenue: 12000000,
      notes: "High potential enterprise account. Interested in bulk licensing.",
      address: { street: "123 Innovation Way", city: "San Jose", state: "CA", country: "USA", zip: "95112" }
    },
    {
      name: "Apex Finance",
      industry: "Financial Services",
      website: "https://apexfin.com",
      phone: "+1-555-0143",
      email: "contact@apexfin.com",
      size: "medium" as const,
      revenue: 4500000,
      notes: "Fintech client looking for integration solutions.",
      address: { street: "45 Wall St", city: "New York", state: "NY", country: "USA", zip: "10005" }
    },
    {
      name: "Nova Health",
      industry: "Healthcare",
      website: "https://novahealth.org",
      phone: "+1-555-0187",
      email: "partners@novahealth.org",
      size: "startup" as const,
      revenue: 800000,
      notes: "Early stage digital health provider.",
      address: { street: "789 Wellness Lane", city: "Boston", state: "MA", country: "USA", zip: "02111" }
    }
  ];

  const companies: any[] = [];
  companiesData.forEach((compData) => {
    const docRef = doc(collection(db, "companies"));
    const company = {
      ...compData,
      id: docRef.id,
      owner: ownerId,
      logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(compData.name)}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    batch.set(docRef, company);
    companies.push(company);
  });

  // 2. Create 10 Contacts
  const contactsData = [
    { firstName: "John", lastName: "Doe", email: "john@acme.com", phone: "+1-555-0201", jobTitle: "VP of Engineering", companyIdx: 0, status: "customer" as const, source: "Referral", notes: "Decision maker for software engineering budget." },
    { firstName: "Sarah", lastName: "Smith", email: "sarah@acme.com", phone: "+1-555-0202", jobTitle: "IT Director", companyIdx: 0, status: "customer" as const, source: "Website", notes: "Point of contact for infrastructure configuration." },
    { firstName: "David", lastName: "Miller", email: "david.m@apexfin.com", phone: "+1-555-0203", jobTitle: "Chief Risk Officer", companyIdx: 1, status: "prospect" as const, source: "LinkedIn", notes: "Met at Finance Summit 2026." },
    { firstName: "Emma", lastName: "Davis", email: "emma@apexfin.com", phone: "+1-555-0204", jobTitle: "Product Manager", companyIdx: 1, status: "prospect" as const, source: "Website", notes: "Evaluating integration APIs." },
    { firstName: "Alex", lastName: "Jones", email: "alex@novahealth.org", phone: "+1-555-0205", jobTitle: "Founder & CEO", companyIdx: 2, status: "lead" as const, source: "LinkedIn", notes: "Interested in scaling operations." },
    { firstName: "Lisa", lastName: "Brown", email: "lisa@novahealth.org", phone: "+1-555-0206", jobTitle: "Head of Operations", companyIdx: 2, status: "lead" as const, source: "Referral", notes: "Focusing on patient onboarding efficiency." },
    { firstName: "Michael", lastName: "Wilson", email: "michael.w@acme.com", phone: "+1-555-0207", jobTitle: "Procurement Manager", companyIdx: 0, status: "customer" as const, source: "Website", notes: "Handles contract execution." },
    { firstName: "Emily", lastName: "Taylor", email: "emily.t@apexfin.com", phone: "+1-555-0208", jobTitle: "VP of Product", companyIdx: 1, status: "prospect" as const, source: "Referral", notes: "Referred by John Doe." },
    { firstName: "James", lastName: "Anderson", email: "james.a@novahealth.org", phone: "+1-555-0209", jobTitle: "CTO", companyIdx: 2, status: "churned" as const, source: "LinkedIn", notes: "Left for another project, account churned." },
    { firstName: "Sophia", lastName: "Thomas", email: "sophia.t@acme.com", phone: "+1-555-0210", jobTitle: "HR Generalist", companyIdx: 0, status: "prospect" as const, source: "Website", notes: "Inquired about training software." }
  ];

  const contacts: any[] = [];
  contactsData.forEach((contData) => {
    const docRef = doc(collection(db, "contacts"));
    const company = companies[contData.companyIdx];
    const contact = {
      firstName: contData.firstName,
      lastName: contData.lastName,
      email: contData.email,
      phone: contData.phone,
      jobTitle: contData.jobTitle,
      companyId: company.id,
      companyName: company.name,
      status: contData.status,
      tags: contData.status === "customer" ? ["VIP", "Enterprise"] : ["Follow-up"],
      source: contData.source,
      owner: ownerId,
      notes: contData.notes,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(contData.firstName + " " + contData.lastName)}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastContactedAt: serverTimestamp()
    };
    batch.set(docRef, { ...contact, id: docRef.id });
    contacts.push({ ...contact, id: docRef.id });
  });

  // 3. Create 8 Deals
  const dealsData = [
    { title: "Acme Licensing Deal", value: 75000, currency: "USD", stage: "closed_won" as const, probability: 100, contactIdx: 0, companyIdx: 0, notes: "12-month license agreement." },
    { title: "Acme Support Contract", value: 15000, currency: "USD", stage: "proposal" as const, probability: 60, contactIdx: 1, companyIdx: 0, notes: "Annual dedicated support tier." },
    { title: "Apex Integration Project", value: 45000, currency: "USD", stage: "negotiation" as const, probability: 80, contactIdx: 2, companyIdx: 1, notes: "Custom API development." },
    { title: "Apex Consultation", value: 8000, currency: "USD", stage: "qualified" as const, probability: 40, contactIdx: 3, companyIdx: 1, notes: "Discovery workshop." },
    { title: "Nova Health Platform Pilot", value: 25000, currency: "USD", stage: "lead" as const, probability: 10, contactIdx: 4, companyIdx: 2, notes: "3-month pilot evaluation." },
    { title: "Nova Health Expansion", value: 60000, currency: "USD", stage: "closed_lost" as const, probability: 0, contactIdx: 8, companyIdx: 2, notes: "Lost due to budget cuts." },
    { title: "Acme Training Software", value: 12000, currency: "USD", stage: "lead" as const, probability: 20, contactIdx: 9, companyIdx: 0, notes: "LMS licensing." },
    { title: "Apex Terminal Subscription", value: 90000, currency: "USD", stage: "closed_won" as const, probability: 100, contactIdx: 7, companyIdx: 1, notes: "Terminal licenses." }
  ];

  const deals: any[] = [];
  dealsData.forEach((dealVal, idx) => {
    const docRef = doc(collection(db, "deals"));
    const contact = contacts[dealVal.contactIdx];
    const company = companies[dealVal.companyIdx];
    
    const expectedClose = new Date();
    expectedClose.setDate(expectedClose.getDate() + (idx + 1) * 15);

    const deal: any = {
      title: dealVal.title,
      value: dealVal.value,
      currency: dealVal.currency,
      stage: dealVal.stage,
      probability: dealVal.probability,
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
      companyId: company.id,
      companyName: company.name,
      owner: ownerId,
      expectedCloseDate: Timestamp.fromDate(expectedClose),
      notes: dealVal.notes,
      tags: ["Seed"],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (dealVal.stage === "closed_won" || dealVal.stage === "closed_lost") {
      deal.actualCloseDate = serverTimestamp();
    }

    batch.set(docRef, { ...deal, id: docRef.id });
    deals.push({ ...deal, id: docRef.id });
  });

  // 4. Create 15 Activities
  const activitiesData = [
    { type: "call" as const, title: "Discovery Call", description: "Introduced our product suite to Alex.", contactIdx: 4, dealIdx: 4, isCompleted: true },
    { type: "email" as const, title: "Follow-up email", description: "Sent pricing proposal to Sarah.", contactIdx: 1, dealIdx: 1, isCompleted: true },
    { type: "meeting" as const, title: "Demo Presentation", description: "Showed platform features to David and team.", contactIdx: 2, dealIdx: 2, isCompleted: true },
    { type: "note" as const, title: "Competitor Note", description: "Nova Health is also evaluating Salesforce.", contactIdx: 4, isCompleted: true },
    { type: "task" as const, title: "Send contract draft", description: "Draft standard terms for Acme review.", contactIdx: 0, dealIdx: 0, isCompleted: true, offsetDays: -2 },
    { type: "task" as const, title: "Follow up on proposal", description: "Ping Sarah regarding Support tier.", contactIdx: 1, dealIdx: 1, isCompleted: false, offsetDays: 0 },
    { type: "task" as const, title: "Prepare negotiation deck", description: "Build business case for Apex.", contactIdx: 2, dealIdx: 2, isCompleted: false, offsetDays: 2 },
    { type: "call" as const, title: "Check-in Call", description: "Quick check-in with John.", contactIdx: 0, dealIdx: 0, isCompleted: true },
    { type: "email" as const, title: "Introductory Email", description: "Inquired about training software.", contactIdx: 9, dealIdx: 6, isCompleted: true },
    { type: "meeting" as const, title: "Contract Alignment", description: "Discussed terms with Michael.", contactIdx: 6, dealIdx: 0, isCompleted: true },
    { type: "task" as const, title: "Send Apex invoice", description: "Send invoice for terminal subscriptions.", contactIdx: 7, dealIdx: 7, isCompleted: false, offsetDays: -1 },
    { type: "note" as const, title: "Budget Constraints", description: "Nova Health CEO mentioned budget constraints.", contactIdx: 8, isCompleted: true },
    { type: "call" as const, title: "Sales pitch", description: "Discussed terminal options with Emily.", contactIdx: 7, dealIdx: 7, isCompleted: true },
    { type: "task" as const, title: "Schedule onboarding", description: "Plan training for Acme users.", contactIdx: 0, dealIdx: 0, isCompleted: false, offsetDays: 5 },
    { type: "email" as const, title: "Security Questionnaire", description: "Sent filled security forms to Sarah.", contactIdx: 1, isCompleted: true }
  ];

  activitiesData.forEach((act) => {
    const docRef = doc(collection(db, "activities"));
    const contact = contacts[act.contactIdx];
    const deal = act.dealIdx !== undefined ? deals[act.dealIdx] : null;

    const activityDate = new Date();
    if (act.offsetDays !== undefined) {
      activityDate.setDate(activityDate.getDate() + act.offsetDays);
    }

    const activity: any = {
      type: act.type,
      title: act.title,
      description: act.description,
      isCompleted: act.isCompleted,
      owner: ownerId,
      createdAt: serverTimestamp()
    };

    if (contact) {
      activity.contactId = contact.id;
      activity.contactName = `${contact.firstName} ${contact.lastName}`;
      activity.companyId = contact.companyId;
    }

    if (deal) {
      activity.dealId = deal.id;
      activity.dealTitle = deal.title;
    }

    if (act.type === "task") {
      activity.dueDate = Timestamp.fromDate(activityDate);
      if (act.isCompleted) {
        activity.completedAt = serverTimestamp();
      }
    }

    batch.set(docRef, { ...activity, id: docRef.id });
  });

  await batch.commit();
}
