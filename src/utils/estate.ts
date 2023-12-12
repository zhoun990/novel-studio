import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import {
  Docs,
  DocsGroupe,
  Groupe,
  Paragraph,
  SelectedGroups,
  Templates,
} from "@/utils/types";
import { GlobalStore, createEstate } from "@e-state/react";
import { Novel, Episode, EpisodeGroups, Plot, PlotGroups, Tables } from "./types";
export const { useEstate, clearEstate, setEstates, store } = createEstate(
  {
    main: {
      session: null as null | Session,
      dif: [],
      paragraphs: [] as Paragraph[],
      focusedLine: 0,
      cursorPosition: { start: 0, end: 0 },
      focus: null as null | { line: number; cursor: number },
      title: "",
      description: "",
      saveLocal: false,
      loading: false,
    },
    persist: {
      novels: {} as Record<string, Novel>,

      episodes: {} as Record<string, Episode>,
      // episodeGroups: {} as Record<string, EpisodeGroups>,
      // selectedEpisodeGroupe: {} as SelectedGroups,
      archive: {} as Record<string, Record<string, Tables["episodes"]["Row"]>>,

      plots: {} as Record<string, Plot>,
      // plotGroups: {} as Record<string, PlotGroups>,
      // selectedPlotGroupe: {} as SelectedGroups,

      docs: {} as Record<string, Docs>,
      // docGroups: {} as Record<string, DocsGroupe>,
      // selectedDocGroupe: {} as SelectedGroups,

      groupeRecord: {} as Record<string, Groupe>,
      selectedGroupeRecord: {} as SelectedGroups,

      signinRecommendation: false,
      timestamp: Date.now(),
      template: null as null | Templates,
    },
  },
  {
    persist: ["persist"],
    storage: AsyncStorage,
    // middleware: {
    // 	persist: {
    // 		episodes: (cv) => {
    // 			console.log("^_^ Log \n file: estate.ts:33 \n cv:", cv);
    // 			return cv;
    // 		},
    // 		novels: (cv) => {
    // 			console.log("^_^ Log \n file: estate.ts:37 \n cv:", cv);
    // 			return cv;
    // 		},
    // 	},
    // },
  }
);
export const setNovel = (
  novel_id: string | string[] | undefined,
  value: Novel | ((currentValue: Novel) => Novel)
) => {
  if (!novel_id) return;
  setEstates.persist(
    {
      novels: (cv) => {
        if (typeof value === "function") {
          cv[String(novel_id)] = value(cv[String(novel_id)]);
          console.log(
            "^_^ Log \n file: estate.ts:59 \n cv[String(novel_id)]:",
            cv[String(novel_id)]
          );
        } else cv[String(novel_id)] = value;
        return cv;
      },
    },
    true
  );
};
export const setEpisode = (
  episode_id: string | string[] | undefined,
  value: Episode | ((currentValue: Episode) => Episode)
) => {
  if (!episode_id) return;
  setEstates.persist(
    {
      episodes: (cv) => {
        if (typeof value === "function") {
          cv[String(episode_id)] = value(cv[String(episode_id)]);
        } else cv[String(episode_id)] = value;
        return cv;
      },
    },
    true
  );
};
export const setGroupeRecord = <T extends keyof EpisodeGroups>(
  groupe_id: string | string[] | undefined,
  prop_name_or_value:
    | T
    | EpisodeGroups
    | ((currentValue: EpisodeGroups) => EpisodeGroups),
  value?: EpisodeGroups[T] | ((currentValue: EpisodeGroups[T]) => EpisodeGroups[T])
) => {
  if (!groupe_id) return;
  const groupeRecord = store.getValue("persist", "groupeRecord");
  const id = String(groupe_id);
  const isT = (value: any): value is T =>
    Object.keys(groupeRecord[id]).some((key) => key === value);
  setEstates.persist(
    {
      groupeRecord: (cv) => {
        if (typeof prop_name_or_value === "function") {
          cv[id] = prop_name_or_value(cv[id]);
        } else if (isT(prop_name_or_value)) {
          if (typeof value === "function")
            cv[id][prop_name_or_value] = value(cv[id][prop_name_or_value]);
          else if (value) cv[id][prop_name_or_value] = value;
        }
        return cv;
      },
    },
    true
  );
};
export const setEpisodeGroups = (
  groupe_id: string | string[] | undefined,
  value: EpisodeGroups | ((currentValue: EpisodeGroups) => EpisodeGroups)
) => {
  if (!groupe_id) return;
  setEstates.persist(
    {
      episodeGroups: (cv) => {
        if (typeof value === "function") {
          cv[String(groupe_id)] = value(cv[String(groupe_id)]);
        } else cv[String(groupe_id)] = value;
        return cv;
      },
    },
    true
  );
};
export const setSelectedEpisodeGroups = (
  id: string | string[] | undefined,
  value: string | null | ((currentValue: string | null) => string | null)
) => {
  if (!id) return;
  setEstates.persist(
    {
      selectedEpisodeGroupe: (cv) => {
        if (typeof value === "function") {
          cv[String(id)] = value(cv[String(id)]);
        } else cv[String(id)] = value;
        return cv;
      },
    },
    true
  );
};
export const setSelectedPlotGroups = (
  id: string | string[] | undefined,
  value: string | null | ((currentValue: string | null) => string | null)
) => {
  if (!id) return;
  setEstates.persist(
    {
      selectedPlotGroupe: (cv) => {
        if (typeof value === "function") {
          cv[String(id)] = value(cv[String(id)]);
        } else cv[String(id)] = value;
        return cv;
      },
    },
    true
  );
};
export const setSelectedGroupe = (
  id: string | string[] | undefined,
  groupe_name: string | string[] | undefined,
  value: string | null | ((currentValue: string | null) => string | null)
) => {
  if (!id || !groupe_name) return;
  setEstates.persist(
    {
      selectedGroupeRecord: (cv) => {
        if (typeof value === "function") {
          cv[String(id) + String(groupe_name)] = value(cv[String(id)]);
        } else cv[String(id)] = value;
        return cv;
      },
    },
    true
  );
};
export const useSelectedGroupe = (
  id: string | string[] | undefined,
  groupe_name: string | string[] | undefined
) => {
  const { selectedGroupeRecord } = useEstate("persist");
  if (!id || !groupe_name) return null;
  return selectedGroupeRecord[String(id) + String(groupe_name)] || null;
};
export const getSelectedGroupe = (
  id: string | string[] | undefined,
  groupe_name: string | string[] | undefined
) => {
  if (!id || !groupe_name) return null;
  return (
    store.getValue("persist", "selectedGroupeRecord")?.[
      String(id) + String(groupe_name)
    ] || null
  );
};
export const setPlot = (
  plot_id: string | string[] | undefined,
  value: Plot | ((currentValue: Plot) => Plot)
) => {
  if (!plot_id) return;
  setEstates.persist(
    {
      plots: (cv) => {
        if (typeof value === "function") {
          cv[String(plot_id)] = value(cv[String(plot_id)]);
        } else cv[String(plot_id)] = value;
        return cv;
        // return cv
      },
    },
    true
  );
};
export const setPlotGroups = (
  id: string | string[] | undefined,
  value: PlotGroups | ((currentValue: PlotGroups) => PlotGroups)
) => {
  if (!id) return;
  setEstates.persist(
    {
      plotGroups: (cv) => {
        if (typeof value === "function") {
          cv[String(id)] = value(cv[String(id)]);
        } else cv[String(id)] = value;
        return cv;
      },
    },
    true
  );
};
export const setDocs = (
  id: string | string[] | undefined,
  value: Docs | ((currentValue: Docs) => Docs)
) => {
  if (!id) return;
  setEstates.persist(
    {
      docs: (cv) => {
        if (typeof value === "function") {
          cv[String(id)] = value(cv[String(id)]);
        } else cv[String(id)] = value;
        return cv;
      },
    },
    true
  );
};
export const setDocGroups = (
  id: string | string[] | undefined,
  value: DocsGroupe | ((currentValue: DocsGroupe) => DocsGroupe)
) => {
  if (!id) return;
  setEstates.persist(
    {
      docGroups: (cv) => {
        if (typeof value === "function") {
          cv[String(id)] = value(cv[String(id)]);
        } else cv[String(id)] = value;
        return cv;
      },
    },
    true
  );
};
