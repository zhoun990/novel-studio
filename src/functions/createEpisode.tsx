import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import {
  getSelectedGroupe,
  setEpisode,
  setEstates,
  setGroupeRecord,
  setNovel,
  store,
} from "@/utils/estate";
import { n } from "@/utils/n";
import { isRemoteNovel } from "../utils/isRemoteNovel";

export async function createEpisode({
  novel_id,
  title,
  onLoading = () => {},
  tags = [],
}: {
  novel_id: string;
  title: string;
  tags?: string[];
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
    const { novels, groupeRecord } = store.getSlice("persist");
    const groupeId = getSelectedGroupe(novel_id, "groups");
    if (!novels[novel_id]) throw new Error("id invalid");
    // const groupeId = selectedEpisodeGroupe[novel_id] || null;

    const createdEpisode = isRemoteNovel(novel_id)
      ? await supabase
          .from("episodes")
          .insert({
            title,
            novel_id,
            tags,
            groupe: groupeId,
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
          tags: [],
          character_count: 0,
          created_at: new Date().toISOString(),
          id: require("uuid").v4(),
          text: "",
          updated_at: new Date().toISOString(),
          groupe: groupeId,
          user_id: null,
          deleted: false,
        };

    setEpisode(createdEpisode.id, createdEpisode);
    const updatedNovel = isRemoteNovel(novel_id)
      ? await supabase
          .from("novels")
          .update({
            episodes_list: [...novels[novel_id]?.episodes_list, createdEpisode.id],
          })
          .eq("id", novel_id)
          .select("episodes_list")
          .single()
          .then(({ data, error }) => {
            if (error || !data?.episodes_list) throw error;
            return data;
          })
      : {
          episodes_list: novels[novel_id].episodes_list.concat(createdEpisode.id),
        };
    setNovel(novel_id, (cv) => {
      cv.episodes_list = updatedNovel.episodes_list;
      cv.updated_at = new Date().toISOString();
      return cv;
    });
    if (groupeId) {
      const updatedEpisodeGroupe = isRemoteNovel(novel_id)
        ? await supabase
            .from("episode_groups")
            .update({
              list: [...groupeRecord[groupeId]?.list, createdEpisode.id],
            })
            .eq("id", groupeId)
            .select("list")
            .single()
            .then(({ data, error }) => {
              if (error || !data?.list) throw error;
              return data;
            })
        : {
            list: groupeRecord[groupeId].list.concat(createdEpisode.id),
          };
      setGroupeRecord(groupeId, "list", updatedEpisodeGroupe.list);
    }
    router.push({
      pathname: "/episode/[episode_id]",
      params: { novel_id, episode_id: createdEpisode.id },
    });
  } catch (error) {
    console.log("err", error);

    if (error instanceof Error) {
      Alert.alert(error.message);
    }
  } finally {
    onLoading(false);
  }
}
