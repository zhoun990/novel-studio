import { setEstates, store } from "@/utils/estate";
import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { isRemoteNovel } from "../utils/isRemoteNovel";
export async function deleteDocGroupe({
  novel_id,
  doc_groupe_id,
  onLoading = () => {},
}: {
  novel_id: string;
  doc_groupe_id: string;
  onLoading?: (isLoading: boolean) => void;
}) {
  try {
    onLoading(true);
    const { novels } = store.getSlice("persist");
    if (!novels[novel_id]) throw new Error("id invalid");
    const novel = novels[novel_id];
    if (isRemoteNovel(novel_id)) {
      await supabase
        .from("doc_groups")
        .delete()
        .eq("id", doc_groupe_id)
        .then(({ error }) => {
          if (error) throw error;
        });

      await supabase
        .from("novels")
        .update({
          doc_groups: novel.doc_groups.filter((groupe) => groupe !== doc_groupe_id),
        })
        .eq("id", doc_groupe_id);
    }
    setEstates.persist(
      {
        selectedDocGroupe: (cv) => {
          const dg = novels[String(novel_id)].doc_groups;
          const i = dg.indexOf(doc_groupe_id);
          cv[String(novel_id)] = dg[Math.max(0, i - 1)] || null;
          return cv;
        },
        novels: (cv) => {
          cv[String(novel_id)].doc_groups = cv[String(novel_id)].doc_groups.filter(
            (groupe) => groupe !== doc_groupe_id
          );
          return cv;
        },
        docGroups: (cv) => {
          delete cv[doc_groupe_id];
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
