import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import { setEstates } from "@/utils/estate";
import { n } from "@/utils/n";

export function createPlotGroupe({
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
		if (typeof novel_id !== "string")
			throw new Error("IDが文字列ではありません！");
		setEstates.persist({
			plotGroups: async (
				plotGroups,
				{ novels, selectedPlotGroupe },
				{ main }
			) => {
				try {
					if (!novels[novel_id]) throw new Error("id invalid");
					if (main.session?.user.id === novels[novel_id]?.user_id) {
						const { error, data } = await supabase
							.from("plot_groups")
							.insert({
								title,
								novel_id,
							})
							.select("*")
							.single();

						if (error || !data) {
							throw error;
						}
						await supabase
							.from("novels")
							.update({
								plot_groups: [...novels[novel_id].plot_groups, data.id],
							})
							.eq("id", novel_id)
							.select("plot_groups")
							.single()
							.then(({ data, error }) => {
								if (!error && data.plot_groups && novels[novel_id]) {
									novels[novel_id].plot_groups = data.plot_groups;
								} else {
									console.error(
										"^_^ Log \n file: index.tsx:63 \n error:",
										error
									);
									throw error;
								}
							});
						plotGroups[data.id] = data;
						selectedPlotGroupe[novel_id] = data.id;

						// setEstates.persist({
						// 	selectedGroupe: (cv) => {
						// 		cv[novel_id] = data.id;
						// 		return cv;
						// 	},
						// });
					} else {
						const id = require("uuid").v4();
						plotGroups[id] = {
							title,
							novel_id,
							created_at: new Date().toISOString(),
							id,
							plots: [],
							updated_at: new Date().toISOString(),
							user_id: null,
						};
						novels[novel_id].updated_at = new Date().toISOString();
						if (!novels[novel_id].plot_groups)
							novels[novel_id].plot_groups = [id];
						else novels[novel_id].plot_groups.push(id);
						selectedPlotGroupe[novel_id] = id;
					}
					return [
						Object.assign({}, plotGroups),
						{},
						{ persist: { novels, selectedPlotGroupe } },
					];
				} catch (error) {
					if (error instanceof Error) {
						Alert.alert(error.message);
					} else {
						console.log("err", error);
					}
					return plotGroups;
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
