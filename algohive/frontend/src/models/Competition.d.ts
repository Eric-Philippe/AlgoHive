import { Catalog } from "./Catalogs";
import { Group } from "./Group";
import { Try } from "./Try";

export interface Competition {
  id: string;
  title: string;
  description: string;
  finished: boolean;
  show: boolean;
  api_theme: string;
  api_environment_id: string;
  api_environment?: Catalog[];
  groups?: Group[];
  tries: Try[];
}
