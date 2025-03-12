export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  permissions: number;
  roles: Role[];
  groups: Group[];
}
