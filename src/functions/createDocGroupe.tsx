import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import {
  setDocGroups,
  setEstates,
  setNovel,
  setSelectedGroupe,
  store,
} from "@/utils/estate";
import { n } from "@/utils/n";
import { isRemoteNovel } from "@/utils/isRemoteNovel";

export async function createDocGroupe({
  novel_id,
  title,
  onLoading = () => {},
}: {
  novel_id: string;
  title: string;
  onLoading?: (isLoading: boolean) => void;
}) {
  try {
    onLoading(true);
    if (!title)
      throw new Error(
        n({
          default: "Title is not entered",
          jp: "タイトルが入力されていません",
        })
      );
    if (typeof novel_id !== "string") throw new Error("IDが文字列ではありません！");
    const { novels } = store.getSlice("persist");
    if (!novels[novel_id]) throw new Error("id invalid");
    const data = isRemoteNovel(novel_id)
      ? await supabase
          .from("doc_groups")
          .insert({
            title,
            novel_id,
          })
          .select("*")
          .single()
          .then(({ data, error }) => {
            if (error || !data) throw error;
            return data;
          })
      : {
          title,
          novel_id,
          created_at: new Date().toISOString(),
          id: require("uuid").v4(),
          docs: [],
          updated_at: new Date().toISOString(),
          user_id: null,
        };
    setDocGroups(data.id, data);
    setSelectedGroupe(novel_id, data.id);
    const updatedNovel = isRemoteNovel(novel_id)
      ? await supabase
          .from("novels")
          .update({
            doc_groups: [...novels[novel_id].doc_groups, data.id],
          })
          .eq("id", novel_id)
          .select("doc_groups")
          .single()
          .then(({ data, error }) => {
            if (error || !data?.doc_groups) throw error;
            return data;
          })
      : { doc_groups: novels[novel_id].doc_groups.concat(data.id) };
    setNovel(novel_id, (cv) => {
      cv.doc_groups = updatedNovel.doc_groups;
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
