import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import {
	setEpisodeGroups,
	setEstates,
	setNovel,
	setSelectedEpisodeGroups,
	store,
} from "@/utils/estate";
import { n } from "@/utils/n";
import { isRemoteNovel } from "@/utils/isRemoteNovel";

export async function createEpisodeGroupe({
	novel_id,
	title,
	color,
	onLoading = () => {},
}: {
	novel_id: string;
	title: string;
	color?: string;
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
		if (typeof novel_id !== "string")
			throw new Error("IDが文字列ではありません！");
		const { novels } = store.getSlice("persist");

		if (!novels[novel_id]) throw new Error("id invalid");

		const data = isRemoteNovel(novel_id)
			? await supabase
					.from("episode_groups")
					.insert({
						title,
						novel_id,
						episodes_list: [],
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
					color: null,
					episodes_list: [],
					// updated_at: new Date().toISOString(),
					user_id: null,
			  };
		setEpisodeGroups(data.id, data);
		const updatedNovels = isRemoteNovel(novel_id)
			? await supabase
					.from("novels")
					.update({
						groups: [...novels[novel_id]?.groups, data.id],
					})
					.eq("id", novel_id)
					.select("groups")
					.single()
					.then(({ data, error }) => {
						if (error || !data?.groups) throw error;
						return data;
					})
			: { groups: novels[novel_id].groups.concat(data.id) };
		setNovel(novel_id, (cv) => {
			cv.groups = updatedNovels.groups;
			cv.updated_at = new Date().toISOString();
			return cv;
		});
		setSelectedEpisodeGroups(novel_id, data.id);
	} catch (error) {
		if (error instanceof Error) {
			Alert.alert(error.message);
		}
		console.log("err", error);
	} finally {
		onLoading(false);
	}
}
