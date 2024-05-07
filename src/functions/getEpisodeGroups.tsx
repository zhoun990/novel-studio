import { setEstates, setGroupeRecord } from "@/utils/estate";
import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { isRemoteNovel } from "@/utils/isRemoteNovel";

export async function getEpisodeGroups({
	novel_id,
	onLoading = () => {},
}: {
	novel_id: string;
	onLoading?: (isLoading: boolean) => void;
}) {
	try {
		if (isRemoteNovel(novel_id)) {
		if (typeof novel_id !== "string")
			throw new Error("IDが文字列ではありません！");
			const { data, error, status } = await supabase
				.from("episode_groups")
				.select("*")
				.eq("novel_id", novel_id)
				.order("updated_at", { ascending: false });
			if (error && status !== 406) {
				throw error;
			}
			if (data) {
				setEstates.persist(
					{
						groupeRecord: (cv) => {
							data.forEach((groupe) => {
								cv[groupe.id] = groupe;
							});
							return cv;
						},
					},
					true
				);
			}
		}
	} catch (error) {
		if (error instanceof Error) {
			Alert.alert(error.message);
		}
	} finally {
		// setLoading(false);
	}
}
