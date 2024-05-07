import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import {
  setDocs,
  setEstates,
  store,
  setNovel,
  getSelectedGroupe,
  setGroupeRecord,
} from "@/utils/estate";
import { n } from "@/utils/n";
import { isRemoteNovel } from "@/utils/isRemoteNovel";

export async function createDoc({
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
    const doc_groupe_id = getSelectedGroupe(novel_id, "doc_groups");

    if (!doc_groupe_id)
      throw new Error(
        n({
          default:
            "No document group is selected. Please create it before creating a document.",
          jp: "資料分類が選択されていません。資料を作成する前に、資料分類を作成してください。",
        })
      );
    const data = isRemoteNovel(novel_id)
      ? await supabase
          .from("docs")
          .insert({
            novel_id,
            doc_groupe_id,
            title: [""],
            text: [""],
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
          title: [""],
          text: [""],
          updated_at: new Date().toISOString(),
          user_id: null,
          doc_groupe_id,
        };
    setDocs(data.id, data);
    const updatedDocGroupe = isRemoteNovel(novel_id)
      ? await supabase
          .from("doc_groups")
          .update({
            list: [...groupeRecord[doc_groupe_id]?.list, data.id],
          })
          .eq("id", doc_groupe_id)
          .select("list")
          .single()
          .then(({ data, error }) => {
            if (error || !data?.list) throw error;
            return data;
          })
      : { list: groupeRecord[doc_groupe_id].list.concat(data.id) };
    setGroupeRecord(doc_groupe_id, "list", updatedDocGroupe.list);
    setNovel(novel_id, (cv) => {
      cv.updated_at = new Date().toISOString();
      return cv;
    });
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
    console.log("err", error);
  } finally {
    onLoading(false);
  }
}
