import { router } from "expo-router";
import { ActionSheetIOS, Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import {
	setDocs,
	setDocGroups,
	setEstates,
	store,
	setNovel,
	setEpisodeGroups,
	setEpisode,
} from "@/utils/estate";
import { n } from "@/utils/n";
import { isRemoteNovel } from "@/utils/isRemoteNovel";

export async function moveEpisodeGroupe({
	novel_id,
	item,
}: {
	novel_id: string | string[] | undefined;
	item: string;
}) {
	try {
		const { novels, episodeGroups, episodes } = store.getSlice("persist");
		const novel = novels[String(novel_id)];

		ActionSheetIOS.showActionSheetWithOptions(
			{
				options: [
					"Cancel",

					...novel.groups.map((id) => episodeGroups[id].title),
				],
				cancelButtonIndex: 0,
				userInterfaceStyle: "dark",
			},
			(buttonIndex) => {
				if (buttonIndex === 0) {
					// cancel action
				} else {
					const i = buttonIndex - 1;
					const currentGroupe = episodes[item].groupe;
					if (currentGroupe)
						setEpisodeGroups(currentGroupe, (cv) => {
							cv.episodes_list = cv.episodes_list.filter((id) => id !== item);
							return cv;
						});
					setEpisodeGroups(novel.groups[i], (cv) => {
						cv.episodes_list.push(item);

						return cv;
					});
					setEpisode(item, (cv) => {
						cv.groupe = novel.groups[i];
						return cv;
					});
				}
			}
		);
	} catch (error) {
		if (error instanceof Error) {
			Alert.alert(error.message);
		}
		console.log("err", error);
	}
}
