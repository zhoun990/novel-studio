import { Database } from "./database.types";

export type Paragraph = { key: string; text: string; height: number };
export type Tables = Database["public"]["Tables"];
export type Novel = Tables["novels"]["Row"] & { synced_at: null | string };
export type Episode = Tables["episodes"]["Row"];
export type EpisodeGroups = Tables["episode_groups"]["Row"];
export type PlotGroups = Tables["plot_groups"]["Row"];
export type Plot = Tables["plots"]["Row"];
export type DocsGroupe = Tables["doc_groups"]["Row"];
export type Docs = Tables["docs"]["Row"];

export type SelectedGroups = Record<string, string | null>;
export type Templates = "basic";
export type Groupe = {
  created_at: string;
  id: string;
  list: string[];
  novel_id: string;
  title: string;
  updated_at: string | null;
  user_id: string | null;
};
export type GroupeNames = "plot_groups" | "doc_groups" | "groups";
