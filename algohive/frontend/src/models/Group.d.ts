export interface Group {
  id: string;
  name: string;
  description: string;
  scopieID: string;
  users?: User[];
}
