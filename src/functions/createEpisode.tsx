import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import { setEstates } from "@/utils/estate";

export function createEpisode(
	novel_id: string,
	onLoading: (isLoading: boolean) => void
) {
	Alert.prompt("エピソードの追加", undefined, async (title) => {
		try {
			onLoading(true);
			if (!title) throw new Error("タイトルが入力されていません");
			if (typeof novel_id !== "string")
				throw new Error("IDが文字列ではありません！");
			setEstates.persist({
				episodes: async (episodes, { novels }, { main }) => {
					try {
						if (main.session?.user.id === novels[String(novel_id)]?.user_id) {
							const { error, data } = await supabase
								.from("episodes")
								.insert({
									title,
									novel_id: novel_id,
									tags: [],
								})
								.select("*")
								.single();

							if (error || !data) {
								throw error;
							}
							await supabase
								.from("novels")
								.update({
									episodes_list: [...novels[novel_id]?.episodes_list, data.id],
								})
								.eq("id", novel_id)
								.select("episodes_list")
								.single()
								.then(({ data, error }) => {
									if (!error && data.episodes_list && novels[novel_id]) {
										novels[novel_id].episodes_list = data.episodes_list;
									} else {
										console.error(
											"^_^ Log \n file: index.tsx:63 \n error:",
											error
										);
										throw error;
									}
								});

							episodes[novel_id] = { ...episodes[novel_id], [data.id]: data };

							router.push({
								pathname: "/[novel_id]/[episode_id]",
								params: { novel_id, episode_id: data.id },
							});
						} else {
							const id = require("uuid").v4();

							if (!episodes[novel_id]) {
								episodes[novel_id] = {};
							}
							episodes[novel_id][id] = {
								title,
								novel_id,
								tags: [],
								character_count: 0,
								created_at: new Date().toISOString(),
								id,
								text: "",
								updated_at: new Date().toISOString(),
							};
							novels[novel_id].updated_at = new Date().toISOString();
							novels[novel_id].episodes_list.push(id);
							router.push({
								pathname: "/[novel_id]/[episode_id]",
								params: { novel_id, episode_id: id },
							});
						}
						return [Object.assign({}, episodes), {}, { persist: { novels } }];
					} catch (error) {
						if (error instanceof Error) {
							Alert.alert(error.message);
						} else {
							console.log("err", error);
						}
						return episodes;
					}
				},
			});
		} catch (error) {
			if (error instanceof Error) {
				Alert.alert(error.message);
			} else {
				console.log("err", error);
			}
		} finally {
			onLoading(false);
		}
	});
}
