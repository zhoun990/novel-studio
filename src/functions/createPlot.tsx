import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import { setEstates } from "@/utils/estate";
import { n } from "@/utils/n";

export function createPlot({
	novel_id,
	onLoading = () => {},
}: {
	novel_id: string;
	onLoading?: (isLoading: boolean) => void;
}) {
	try {
		onLoading(true);

		if (typeof novel_id !== "string")
			throw new Error("IDが文字列ではありません！");

		setEstates.persist({
			plots: async (
				plots,
				{ novels, plotGroups, selectedPlotGroupe },
				{ main }
			) => {
				try {
					if (!novels[novel_id]) throw new Error("id invalid");
					const plot_groupe_id = selectedPlotGroupe[novel_id];
					if (!plot_groupe_id)
						throw new Error(
							n({
								default:
									"No plot group is selected. Please create a plot group before creating a plot.",
								jp: "プロットグループが選択されていません。プロットを作成する前に、プロットグループを作成してください。",
							})
						);
					if (main.session?.user.id === novels[novel_id]?.user_id) {
						const { error, data } = await supabase
							.from("plots")
							.insert({
								novel_id,
								plot_groupe_id,
							})
							.select("*")
							.single();

						if (error || !data) {
							throw error;
						}
						await supabase
							.from("plot_groups")
							.update({
								plots: [...plotGroups[plot_groupe_id]?.plots, data.id],
							})
							.eq("id", plot_groupe_id)
							.select("plots")
							.single()
							.then(({ data, error }) => {
								if (!error && data.plots && plotGroups[plot_groupe_id]) {
									plotGroups[plot_groupe_id].plots = data.plots;
								} else {
									console.error(
										"^_^ Log \n file: index.tsx:63 \n error:",
										error
									);
									throw error;
								}
							});

						plots[data.id] = data;
					} else {
						const id = require("uuid").v4();
						plots[id] = {
							novel_id,
							created_at: new Date().toISOString(),
							id,
							text: "",
							updated_at: new Date().toISOString(),
							user_id: null,
							plot_groupe_id,
						};
						console.log(
							"^_^ Log \n file: createPlot.tsx:74 \n plots[id]:",
							plots[id]
						);

						novels[novel_id].updated_at = new Date().toISOString();
						console.log(
							"^_^ Log \n file: createPlot.tsx:88 \n novels[novel_id]:",
							plotGroups[plot_groupe_id],id
						);
						plotGroups[plot_groupe_id].plots = [
							...plotGroups[plot_groupe_id].plots,
							id,
						];
						console.log(
							"^_^ Log \n file: createPlot.tsx:90 \n plotGroups[plot_groupe_id].plots:",
							plotGroups[plot_groupe_id].plots
						);
					}
					return [Object.assign({}, plots), {}, { persist: { plotGroups } }];
				} catch (error) {
					if (error instanceof Error) {
						Alert.alert(error.message);
					}
					console.log("err", error);

					return plots;
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
