import { getSelectedGroupe, setEstates, store } from "@/utils/estate";
import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { isRemoteNovel } from "../utils/isRemoteNovel";
export async function deletePlot({
  novel_id,
  plot_id,
  onLoading = () => {},
}: {
  novel_id: string;
  plot_id: string;
  onLoading?: (isLoading: boolean) => void;
}) {
  try {
    const selected = getSelectedGroupe(novel_id, "plot_groups");
    if (!selected) throw new Error("Not selected");
    const { plots, groupeRecord, novels } = store.getSlice("persist");
    const plot = plots[plot_id];
    if (!plot) throw new Error("No plot found");

    const plot_groups = novels[String(novel_id)].plot_groups.filter(
      (value) => value !== plot_id
    );
    const groupeList = groupeRecord[selected].list.filter((value) => value !== plot_id);
    setEstates.persist(
      {
        plots: (cv) => {
          delete cv[plot_id];
          return cv;
        },
        novels: (cv) => {
          cv[String(novel_id)].plot_groups = plot_groups;
          return cv;
        },
        groupeRecord: (cv) => {
          if (cv[selected]) {
            cv[selected].list = groupeList;
          }
          return cv;
        },
      },
      true
    );

    if (isRemoteNovel(novel_id)) {
      supabase
        .from("plots")
        .delete()
        .eq("id", plot_id)
        .then(({ error }) => {
          if (error) {
          } else {
            supabase
              .from("novels")
              .update({ plot_groups })
              .eq("id", String(novel_id))
              .then((res) => {
                console.log("^_^ Log \n file: index.tsx:203 \n res:", res);
              });
            if (groupeRecord[selected]) {
              supabase
                .from("plot_groups")
                .update({ list: groupeList })
                .eq("id", selected)
                .then((res) => {
                  console.log("^_^ Log \n file: index.tsx:203 \n res:", res);
                });
            }
          }
        });
    }
  } catch (error) {
    console.error("^_^ Log \n file: Account.tsx:69 \n error:", error);
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
  }
}
