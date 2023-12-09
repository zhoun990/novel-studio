import { Database } from "./database.types";

export type Paragraph = { key: string; text: string; height: number };
export type Tables = Database["public"]["Tables"];
export type Novel = Tables["novels"]["Row"] & { synced_at: null | string };
export type Episode = Tables["episodes"]["Row"];
export type Groupe = Tables["episode_groups"]["Row"];
export type PlotGroups = Tables["plot_groups"]["Row"];
export type Plot = Tables["plots"]["Row"];
