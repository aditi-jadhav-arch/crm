export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  timezone?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  companyId?: string;        // ref to companies
  companyName?: string;      // denormalized
  status: 'lead' | 'prospect' | 'customer' | 'churned';
  tags?: string[];
  source: string;           // e.g. "Website", "Referral", "LinkedIn"
  owner: string;            // uid of assigned user
  avatarUrl?: string;
  notes?: string;
  createdAt: any;           // Firestore Timestamp or Date
  updatedAt: any;
  lastContactedAt?: any;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  size: 'startup' | 'small' | 'medium' | 'enterprise';
  revenue?: number;
  logoUrl?: string;
  notes?: string;
  owner: string;
  createdAt: any;
  updatedAt: any;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;      // 0-100
  contactId?: string;
  contactName?: string;
  companyId?: string;
  companyName?: string;
  owner: string;
  expectedCloseDate: any;
  actualCloseDate?: any;
  notes?: string;
  tags?: string[];
  createdAt: any;
  updatedAt: any;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string;
  description?: string;
  contactId?: string;
  contactName?: string;
  dealId?: string;
  dealTitle?: string;
  companyId?: string;
  dueDate?: any;
  completedAt?: any;
  isCompleted: boolean;
  owner: string;
  createdAt: any;
}
