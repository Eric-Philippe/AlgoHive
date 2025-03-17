import { Catalog } from "./Catalogs";
import { Group } from "./Group";
import { Try } from "./Try";

export interface Competition {
  id: string;
  title: string;
  description: string;
  finished: boolean;
  show: boolean;
  catalog_theme: string;
  catalog_id: string;
  catalog?: Catalog;
  groups?: Group[];
  tries: Try[];
}
