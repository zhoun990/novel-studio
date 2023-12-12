import {
  setEstates,
  store
} from "@/utils/estate";
import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { isRemoteNovel } from "../utils/isRemoteNovel";
export async function deleteEpisodeGroupe({
  novel_id,
  episode_groupe_id,
  onLoading = () => {},
}: {
  novel_id: string;
  episode_groupe_id: string;
  onLoading?: (isLoading: boolean) => void;
}) {
  try {
    onLoading(true);
    const { novels } = store.getSlice("persist");
    if (!novels[novel_id]) throw new Error("id invalid");
    const novel = novels[novel_id];
    if (isRemoteNovel(novel_id)) {
      await supabase
        .from("episode_groups")
        .delete()
        .eq("id", episode_groupe_id)
        .then(({ data, error }) => {
          if (error) throw error;
        });
      await supabase
        .from("novels")
        .update({
          groups: novel.groups.filter((groupe) => groupe !== episode_groupe_id),
        })
        .eq("id", episode_groupe_id)
        .then(({ data, error }) => {
          if (error) throw error;
        });
    }
    setEstates.persist(
      {
        selectedEpisodeGroupe: (cv) => {
          const dg = novels[String(novel_id)].groups;
          const i = dg.indexOf(episode_groupe_id);
          cv[String(novel_id)] = dg[Math.max(0, i - 1)] || null;
          return cv;
        },
        novels: (cv) => {
          cv[String(novel_id)].groups = cv[String(novel_id)].groups.filter(
            (groupe) => groupe !== episode_groupe_id
          );
          return cv;
        },
        episodeGroups: (cv) => {
          delete cv[episode_groupe_id];
          return cv;
        },
      },
      true
    );
  } catch (error) {
    console.error("^_^ Log \n file: Account.tsx:69 \n error:", error);
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
  }
}
