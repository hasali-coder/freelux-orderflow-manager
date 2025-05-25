
export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredPaymentMethod: string;
  notes: string;
  createdAt: string;
};

export type OrderStatus = 'pending' | 'complete' | 'overdue';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export type Order = {
  id: string;
  clientId: string;
  title: string;
  description: string;
  deadline: string;
  cost: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  amountPaid?: number; // New field to track amount paid
};

export type ExpenseCategory = 'tools' | 'communication' | 'utilities' | 'supplies' | 'travel' | 'other';

export type Expense = {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  notes: string;
};

// New types for calendar functionality
export type EventType = 'deadline' | 'meeting' | 'personal';

export type CalendarEventItem = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: EventType;
  clientId?: string;
  orderId?: string;
  status?: string;
  color?: string;
};

/**
 * A single expense record as stored in your Supabase `expenses` table
 */
export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;             // ISO date string
  category: ExpenseCategory;
  notes?: string;
  created_at: string;       // timestamp
}

/**
 * The allowed categories for an expense
 * (must match whatever you use in your Select dropdown)
 */
export type ExpenseCategory =
  | "tools"
  | "communication"
  | "utilities"
  | "supplies"
  | "travel"
  | "other";