import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import { setEstates } from "@/utils/estate";
import { n } from "@/utils/n";

export function createGroupe({
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
		setEstates.persist({
			episodeGroups: async (groups, { novels }, { main }) => {
				try {
					if (!novels[novel_id]) throw new Error("id invalid");

					if (main.session?.user.id === novels[novel_id]?.user_id) {
						const { error, data } = await supabase
							.from("episode_groups")
							.insert({
								title,
								novel_id,
								episodes_list: [],
							})
							.select("*")
							.single();

						if (error || !data) {
							throw error;
						}
						await supabase
							.from("novels")
							.update({
								groups: [...novels[novel_id]?.groups, data.id],
							})
							.eq("id", novel_id)
							.select("groups")
							.single()
							.then(({ data, error }) => {
								if (!error && data.groups && novels[novel_id]) {
									novels[novel_id].groups = data.groups;
								} else {
									console.error(
										"^_^ Log \n file: index.tsx:63 \n error:",
										error
									);
									throw error;
								}
							});

						groups[data.id] = data;
						setEstates.persist({
							selectedGroupe: (cv) => {
								cv[novel_id] = data.id;
								return cv;
							},
						});
					} else {
						const id = require("uuid").v4();

						groups[id] = {
							title,
							novel_id,
							created_at: new Date().toISOString(),
							id,
							color: null,
							episodes_list: [],
							// updated_at: new Date().toISOString(),
							user_id: null,
						};
						novels[novel_id].updated_at = new Date().toISOString();
						if (!novels[novel_id].groups) novels[novel_id].groups = [id];
						else novels[novel_id].groups.push(id);
						setEstates.persist({
							selectedGroupe: (cv) => {
								cv[novel_id] = id;
								return cv;
							},
						});
					}
					return [Object.assign({}, groups), {}, { persist: { novels } }];
				} catch (error) {
					if (error instanceof Error) {
						Alert.alert(error.message);
					} else {
						console.log("err", error);
					}
					return groups;
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
}
