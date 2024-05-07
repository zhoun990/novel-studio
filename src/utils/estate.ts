import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import {
  Docs,
  DocsGroupe,
  Groupe,
  GroupeNames,
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
    // debag: true,
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
// export const setRecordValue = <
//   Persist extends (typeof store.store)["persist"],
//   T extends keyof (typeof store.store)["persist"],
//   Key extends keyof Persist[T],
//   Value extends Persist[T][Key],
//   Prop extends keyof Value
// >(
//   target: T,
//   key: Key,
//   prop_name_or_value: Prop | Value | ((currentValue: Value) => Value),
//   value: Value[Prop] | ((currentValue: Value[Prop]) => Value[Prop])
// ) => {
//   if (!key) return;
//   const groupeRecord = store.getValue("persist", target);

//   const isT = (value: any): value is T =>
//     !!groupeRecord && Object.keys(groupeRecord!.[id]).some((key) => key === value);

//   setEstates.persist(
//     {
//       [target]: (cv: Persist[T]) => {
//         if (typeof prop_name_or_value === "function") {
//           cv[key] = prop_name_or_value(cv[key]);
//         } else if (isT(prop_name_or_value)) {
//           if (typeof value === "function")
//             cv[key][prop_name_or_value] = value(cv[key][prop_name_or_value]);
//           else if (value) cv[key][prop_name_or_value] = value;
//         }
//         return cv;
//       },
//     },
//     true
//   );
// };
export const setGroupeRecord = <T extends keyof EpisodeGroups>(
  groupe_id: string | string[] | undefined,
  prop_name_or_value:
    | T
    | EpisodeGroups
    | ((currentValue: EpisodeGroups) => EpisodeGroups),
  value?: EpisodeGroups[T] | ((currentValue: EpisodeGroups[T]) => EpisodeGroups[T])
) => {
  if (!groupe_id) return;
  try {
    setEstates.persist({
      groupeRecord: (cv) => {
        const v = { ...cv };
        const id = String(groupe_id);
        const isT = (value: any): value is T =>
          !!v[id] && Object.keys(v[id]).some((key) => key === value);

        if (typeof prop_name_or_value === "function") {
          v[id] = prop_name_or_value(v[id]);
        } else if (typeof prop_name_or_value !== "object" && isT(prop_name_or_value)) {
          if (typeof value === "function")
            v[id][prop_name_or_value] = value(v[id][prop_name_or_value]);
          else if (value) v[id][prop_name_or_value] = value;
        } else {
          v[id] = prop_name_or_value as EpisodeGroups;
        }

        return v;
      },
    });
  } catch (error) {
    console.error("^_^ ::: file: estate.ts:168 ::: error:\n", error);
  }
};
// export const setEpisodeGroups = (
//   groupe_id: string | string[] | undefined,
//   value: EpisodeGroups | ((currentValue: EpisodeGroups) => EpisodeGroups)
// ) => {
//   if (!groupe_id) return;
//   setEstates.persist(
//     {
//       episodeGroups: (cv) => {
//         if (typeof value === "function") {
//           cv[String(groupe_id)] = value(cv[String(groupe_id)]);
//         } else cv[String(groupe_id)] = value;
//         return cv;
//       },
//     },
//     true
//   );
// };
// export const setSelectedEpisodeGroups = (
//   id: string | string[] | undefined,
//   value: string | null | ((currentValue: string | null) => string | null)
// ) => {
//   if (!id) return;
//   setEstates.persist(
//     {
//       selectedEpisodeGroupe: (cv) => {
//         if (typeof value === "function") {
//           cv[String(id)] = value(cv[String(id)]);
//         } else cv[String(id)] = value;
//         return cv;
//       },
//     },
//     true
//   );
// };
// export const setSelectedPlotGroups = (
//   id: string | string[] | undefined,
//   value: string | null | ((currentValue: string | null) => string | null)
// ) => {
//   if (!id) return;
//   setEstates.persist(
//     {
//       selectedPlotGroupe: (cv) => {
//         if (typeof value === "function") {
//           cv[String(id)] = value(cv[String(id)]);
//         } else cv[String(id)] = value;
//         return cv;
//       },
//     },
//     true
//   );
// };
export const setSelectedGroupe = (
  novel_id: string | string[] | undefined,
  groupe_name: GroupeNames,
  value: string | null | ((currentValue: string | null) => string | null)
) => {
  if (!novel_id || !groupe_name) return;
  const id = String(novel_id) + String(groupe_name);
  setEstates.persist(
    {
      selectedGroupeRecord: (cv) => {
        if (typeof value === "function") {
          cv[id] = value(cv[id]);
        } else {
          cv[id] = value;
        }
        return cv;
      },
    },
    true
  );
};
export const useSelectedGroupe = (
  novel_id: string | string[] | undefined,
  groupe_name: GroupeNames
) => {
  const { selectedGroupeRecord } = useEstate("persist");
  if (!novel_id || !groupe_name) return null;
  const id = String(novel_id) + String(groupe_name);

  return selectedGroupeRecord[id] || null;
};
export const getSelectedGroupe = (
  novel_id: string | string[] | undefined,
  groupe_name: GroupeNames
) => {
  if (!novel_id || !groupe_name) return null;
  const id = String(novel_id) + String(groupe_name);
  return store.getValue("persist", "selectedGroupeRecord")?.[id] || null;
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
// export const setPlotGroups = (
//   id: string | string[] | undefined,
//   value: PlotGroups | ((currentValue: PlotGroups) => PlotGroups)
// ) => {
//   if (!id) return;
//   setEstates.persist(
//     {
//       plotGroups: (cv) => {
//         if (typeof value === "function") {
//           cv[String(id)] = value(cv[String(id)]);
//         } else cv[String(id)] = value;
//         return cv;
//       },
//     },
//     true
//   );
// };
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
// export const setDocGroups = (
//   id: string | string[] | undefined,
//   value: DocsGroupe | ((currentValue: DocsGroupe) => DocsGroupe)
// ) => {
//   if (!id) return;
//   setEstates.persist(
//     {
//       docGroups: (cv) => {
//         if (typeof value === "function") {
//           cv[String(id)] = value(cv[String(id)]);
//         } else cv[String(id)] = value;
//         return cv;
//       },
//     },
//     true
//   );
// };
