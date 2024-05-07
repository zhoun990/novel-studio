import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import { setEstates, setNovel, store } from "@/utils/estate";
import { n } from "@/utils/n";
import { isRemoteNovel } from "@/utils/isRemoteNovel";
import { createDocGroupe } from "./createDocGroupe";
import { createDoc } from "./createDoc";
import { Templates } from "@/utils/types";
export async function createNovel({
  title,
  description = "",
  onLoading = () => {},
  local = false,
  template,
}: {
  title: string;
  description?: string;
  onLoading?: (isLoading: boolean) => void;
  local?: boolean;
  template?: Templates;
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
    const session = store.getValue("main", "session");
    const isRemote = !local && session?.user.id;
    const data = isRemote
      ? await supabase
          .from("novels")
          .insert({
            title,
            description,
            episodes_list: [],
          })
          .select("*")
          .single()
          .then(({ data, error }) => {
            if (error || !data) throw error;
            return { ...data, synced_at: new Date().toISOString() };
          })
      : {
          created_at: new Date().toISOString(),
          description: "",
          episodes_list: [],
          id: require("uuid").v4(),
          note: "",
          target_character_count: 0,
          updated_at: new Date().toISOString(),
          user_id: null,
          title,
          synced_at: null,
          groups: [],
          plot_groups: [],
          doc_groups: [],
        };
    setNovel(data.id, data);

    // if (template === "basic") {
    //   await createPlotGroupe({
    //     novel_id: data.id,
    //     title: n({ default: "Chapter I.", jp: "第一章" }),
    //   });
    //   await createDocGroupe({
    //     novel_id: data.id,
    //     title: n({ default: "Characters", jp: "登場人物" }),
    //   });
    //   await createDoc({ novel_id: data.id });
    // }
    router.push({
      pathname: "/[novel_id]",
      params: { novel_id: data.id },
    });
  } catch (error) {
    console.error("^_^ Log \n file: Account.tsx:69 \n error:", error);
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
  } finally {
    onLoading(false);
  }
}
