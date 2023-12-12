import { setEstates } from "@/utils/estate";
import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { isRemoteNovel } from "@/utils/isRemoteNovel";

export async function getEpisodes({
	novel_id,
	onLoading = () => {},
}: {
	novel_id: string;
	onLoading?: (isLoading: boolean) => void;
}) {
	try {
		onLoading(true);
		if (isRemoteNovel(novel_id)) {
			if (typeof novel_id !== "string")
				throw new Error("IDが文字列ではありません！");
			const { data, error, status } = await supabase
				.from("episodes")
				.select("*")
				.eq("novel_id", novel_id)
				.order("updated_at", { ascending: false });
			if (error && status !== 406) {
				throw error;
			}
			if (data) {
				setEstates.persist(
					{
						episodes: (cv) => {
							data.forEach((novel) => {
								cv[novel.id] = novel;
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
		onLoading(false);
	}
}
