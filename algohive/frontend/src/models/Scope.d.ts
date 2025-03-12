import { Catalog } from "./Catalogs";
import { Role } from "./Role";

export interface Scope {
  id: string;
  name: string;
  description: string;
  roles?: Role[];
  catalogs?: Catalog[];
}
