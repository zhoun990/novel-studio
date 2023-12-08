import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import { setEstates } from "@/utils/estate";
import { n } from "@/utils/n";

export async function createNovel({
	title,
	description = "",
	onLoading = () => {},
	local = false,
}: {
	title: string;
	description?: string;
	onLoading?: (isLoading: boolean) => void;
	local?: boolean;
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
		setEstates.persist({
			novels: async (cv, _, { main }) => {
				if (!local && main.session?.user) {
					const { error, data } = await supabase
						.from("novels")
						.insert({
							title,
							description,
							episodes_list: [],
						})
						.select("*")
						.single();
					if (error || !data) {
						throw error;
					}
					router.push({
						pathname: "/[novel_id]",
						params: { novel_id: data.id },
					});
					cv[data.id] = { ...data, synced_at: new Date().toISOString() };
				} else {
					const id = require("uuid").v4();
					router.push({
						pathname: "/[novel_id]",
						params: { novel_id: id },
					});
					cv[id] = {
						created_at: new Date().toISOString(),
						description: "",
						episodes_list: [],
						id,
						note: "",
						target_character_count: 0,
						updated_at: new Date().toISOString(),
						user_id: null,
						title,
						synced_at: null,
						groups: [],
					};
				}
				return cv;
			},
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
