import { setEstates, setGroupeRecord, setSelectedGroupe, store } from "@/utils/estate";
import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { isRemoteNovel } from "../utils/isRemoteNovel";
export async function deleteGroupe<T extends "plot_groups" | "doc_groups" | "groups">({
  groupe_name,
  novel_id,
  groupe_id,
  onLoading = () => {},
}: {
  groupe_name: T;
  novel_id: string;
  groupe_id: string;
  onLoading?: (isLoading: boolean) => void;
}) {
  try {
    onLoading(true);
    const { novels } = store.getSlice("persist");
    if (!novels[novel_id]) throw new Error("id invalid");
    const novel = novels[novel_id];
    if (isRemoteNovel(novel_id)) {
      await supabase
        .from(groupe_name)
        .delete()
        .eq("id", groupe_id)
        .then(({ error }) => {
          if (error) throw error;
        });

      await supabase
        .from("novels")
        .update({
          [groupe_name]: novel[groupe_name].filter((groupe) => groupe !== groupe_id),
        })
        .eq("id", groupe_id);
    }
    const dg = novels[novel_id][groupe_name];
    const i = dg.indexOf(groupe_id);
    setSelectedGroupe(novel_id, groupe_name, dg[Math.max(0, i - 1)] || null);

    setEstates.persist(
      {
        novels: (cv) => {
          cv[novel_id][groupe_name] = cv[novel_id][groupe_name].filter(
            (groupe) => groupe !== groupe_id
          );
          return cv;
        },
        groupeRecord: (cv) => {
          delete cv[groupe_id];
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
