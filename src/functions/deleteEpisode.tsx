import {
	setEstates,
	store
} from "@/utils/estate";
import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { isRemoteNovel } from "../utils/isRemoteNovel";

export async function deleteEpisode({
	novel_id,
	episode_id,
	onLoading = () => {},
}: {
	novel_id: string;
	episode_id: string;
	onLoading?: (isLoading: boolean) => void;
}) {
	try {
		onLoading(true);

		if (typeof novel_id !== "string")
			throw new Error("IDが文字列ではありません！");
		const { novels, episodes, groupeRecord } =
			store.getSlice("persist");
		if (!novels[novel_id]) throw new Error("id invalid");
		const episode = episodes[episode_id];

		const episodeList = novels[episode.novel_id].episodes_list.filter(
			(value) => value !== episode_id
		);

		const groupeList =
			episode.groupe && groupeRecord[episode.groupe]
				? groupeRecord[episode.groupe].list.filter(
						(value) => value !== episode_id
				  )
				: [];
		if (isRemoteNovel(novel_id)) {
			await supabase
				.from("episodes")
				.update({ deleted: true })
				.eq("id", episode_id)
				.then(({ error }) => {
					if (error) throw error;
				});
			await supabase
				.from("novels")
				.update({ episodes_list: episodeList })
				.eq("id", String(novel_id));
			if (episode.groupe && groupeRecord[episode.groupe]) {
				supabase
					.from("episode_groups")
					.update({ list: groupeList })
					.eq("id", episode.groupe)
					.then((res) => {
						console.log("^_^ Log \n file: index.tsx:203 \n res:", res);
					});
			}
		}
		if (episode) {
			setEstates.persist({
				archive: (cv) => Object.assign({ [episode_id]: episode }, cv),
				episodes: (cv) => {
					delete cv[episode_id];
					return cv;
				},
				novels: (cv) => {
					cv[episode.novel_id].episodes_list = episodeList;
					return cv;
				},
				groupeRecord: (cv) => {
					if (episode.groupe && cv[episode.groupe]) {
						cv[episode.groupe].list = groupeList;
					}
					return cv;
				},
			});
		}
	} catch (error) {
		console.log("err", error);

		if (error instanceof Error) {
			Alert.alert(error.message);
		}
	} finally {
		onLoading(false);
	}
}
