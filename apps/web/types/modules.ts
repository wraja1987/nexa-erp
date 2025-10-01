export type ModuleNode = {
  id: string;
  name: string;
  path: string;
  icon?: string;
  order?: number;
  flags?: string[];
  children?: ModuleNode[];
};
export type ModulesTree = ModuleNode[];
