import { Catalog } from "./Catalogs";
import { Group } from "./Group";
import { Role } from "./Role";

export interface Scope {
  id: string;
  name: string;
  description: string;
  roles?: Role[];
  groups?: Group[];
  catalogs?: Catalog[];
}
