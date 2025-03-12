import { User } from "./User";

export interface Role {
  id: string;
  name: string;
  permissions: number;
  users?: User[];
}
