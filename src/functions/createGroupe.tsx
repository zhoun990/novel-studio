import { setGroupeRecord, setNovel, setSelectedGroupe, store } from "@/utils/estate";
import { isRemoteNovel } from "@/utils/isRemoteNovel";
import { n } from "@/utils/n";
import { supabase } from "@/utils/supabase";
import { Groupe, Novel } from "@/utils/types";
import { Alert } from "react-native";

export async function createGroupe<T extends "plot_groups" | "doc_groups" | "groups">({
  groupe_name,

  novel_id,
  title,
  onLoading = () => {},
}: {
  groupe_name: T;
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
    const data: Groupe = isRemoteNovel(novel_id)
      ? await supabase
          .from(groupe_name)
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
          list: [],
          updated_at: new Date().toISOString(),
          user_id: null,
        };
    setGroupeRecord(data.id, data);
    const updatedNovel: { [k in typeof groupe_name]: Novel[k] } = isRemoteNovel(novel_id)
      ? await supabase
          .from("novels")
          .update({
            [groupe_name]: [...novels[novel_id][groupe_name], data.id],
          })
          .eq("id", novel_id)
          .select(groupe_name)
          .single()
          .then(({ data, error }: any) => {
            if (error || !data[groupe_name]) throw error;
            return data;
          })
      : { [groupe_name]: novels[novel_id][groupe_name].concat(data.id) };
    setNovel(novel_id, (cv) => ({
      ...cv,
      ...updatedNovel,
      updated_at: new Date().toISOString(),
    }));
    setSelectedGroupe(novel_id, groupe_name, data.id);
  } catch (error) {
    console.log("^_^ ::: file: createGroupe.tsx:77 ::: error:\n", error);
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
  } finally {
    onLoading(false);
  }
}
