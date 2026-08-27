export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  ordersCount: number;
  totalSpent: string;
  tags: string[];
  companyName?: string;
  state: "ENABLED" | "DISABLED" | "INVITED";
  createdAt: string;
  notes?: string;
};

export type CustomerFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags?: string;
  companyName?: string;
  notes?: string;
};
