import { setEstates, store } from "@/utils/estate";
import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { isRemoteNovel } from "../utils/isRemoteNovel";
export async function deletePlotGroupe({
  novel_id,
  plot_groupe_id,
  onLoading = () => {},
}: {
  novel_id: string;
  plot_groupe_id: string;
  onLoading?: (isLoading: boolean) => void;
}) {
  try {
    onLoading(true);
    const { novels } = store.getSlice("persist");
    if (!novels[novel_id]) throw new Error("id invalid");
    const novel = novels[novel_id];
    if (isRemoteNovel(novel_id)) {
      const { error } = await supabase
        .from("plot_groups")
        .delete()
        .eq("id", plot_groupe_id)
        .then(async (props) => {
          const { error } = await supabase
            .from("novels")
            .update({
              plot_groups: novel.plot_groups.filter(
                (groupe) => groupe !== plot_groupe_id
              ),
            })
            .eq("id", plot_groupe_id);
          return {
            ...props,
            error: error || props.error,
          };
        });
      if (error) {
        throw error;
      }
    }
    setEstates.persist(
      {
        selectedPlotGroupe: (cv) => {
          const dg = novels[String(novel_id)].plot_groups;
          const i = dg.indexOf(plot_groupe_id);
          cv[String(novel_id)] = dg[Math.max(0, i - 1)] || null;
          return cv;
        },
        novels: (cv) => {
          cv[String(novel_id)].plot_groups = cv[String(novel_id)].plot_groups.filter(
            (groupe) => groupe !== plot_groupe_id
          );
          return cv;
        },
        plotGroups: (cv) => {
          delete cv[plot_groupe_id];
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
