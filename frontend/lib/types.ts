export interface CargoItem {
  _id?: string;
  id: string;
  destination: string;
  weight: number;
  createdAt: string | Date;
}

export type UserRole = "Admin" | "Standard";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}
