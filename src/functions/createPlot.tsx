import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import {
  getSelectedGroupe,
  setEstates,
  setGroupeRecord,
  setNovel,
  setPlot,
  store,
} from "@/utils/estate";
import { n } from "@/utils/n";
import { isRemoteNovel } from "@/utils/isRemoteNovel";

export async function createPlot({
  novel_id,
  onLoading = () => {},
}: {
  novel_id: string;
  onLoading?: (isLoading: boolean) => void;
}) {
  try {
    onLoading(true);

    if (typeof novel_id !== "string") throw new Error("IDが文字列ではありません！");
    const { novels, groupeRecord } = store.getSlice("persist");
    if (!novels[novel_id]) throw new Error("id invalid");
    const plot_groupe_id = getSelectedGroupe(novel_id, "plot_groups");
    if (!plot_groupe_id)
      throw new Error(
        n({
          default: "No plot group is selected. Please create it before creating a plot.",
          jp: "プロットグループが選択されていません。プロットを作成する前に、プロットグループを作成してください。",
        })
      );
    const data = isRemoteNovel(novel_id)
      ? await supabase
          .from("plots")
          .insert({
            novel_id,
            plot_groupe_id,
          })
          .select("*")
          .single()
          .then(({ data, error }) => {
            if (error || !data) throw error;
            return data;
          })
      : {
          novel_id,
          created_at: new Date().toISOString(),
          id: require("uuid").v4(),
          text: "",
          updated_at: new Date().toISOString(),
          user_id: null,
          plot_groupe_id,
        };
    setPlot(data.id, data);
    const updatedPlotGroupe = isRemoteNovel(novel_id)
      ? await supabase
          .from("plot_groups")
          .update({
            list: [...groupeRecord[plot_groupe_id]?.list, data.id],
          })
          .eq("id", plot_groupe_id)
          .select("list")
          .single()
          .then(({ data, error }) => {
            if (error || !data?.list) throw error;
            return data;
          })
      : { list: groupeRecord[plot_groupe_id].list.concat(data.id) };
    setGroupeRecord(plot_groupe_id, "list", updatedPlotGroupe.list);
    setNovel(novel_id, (cv) => ({ ...cv, updated_at: new Date().toISOString() }));
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
    console.log("err", error);
  } finally {
    onLoading(false);
  }
}
