import { Scope } from "./Scope";
import { User } from "./User";

export interface Role {
  id: string;
  name: string;
  permissions: number;
  users: User[] | null;
  scopes: Scope[] | null;
}
