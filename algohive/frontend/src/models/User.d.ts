export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  permissions: number;
  blocked: boolean;
  last_connected: string;
  roles: Role[];
  groups: Group[];
}
