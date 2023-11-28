import {
	Link,
	router,
	useFocusEffect,
	useLocalSearchParams,
	useNavigation,
} from "expo-router";
import {
	StyleSheet,
	Alert,
	SafeAreaView,
	View,
	TextInput,
	Dimensions,
} from "react-native";
import Text from "@/components/CustomText";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Button, Input } from "react-native-elements";
import { clearEstate, setEstates, useEstate } from "@/utils/estate";
import { SwipeableList } from "@/components/Swipeable";
import { createEpisode } from "@/../../functions/createEpisode";
const WindowWidth = Dimensions.get("window").width;

export default function Page() {
	const { session } = useEstate("main");
	const { episodes, novels, setEstate } = useEstate("persist");
	const [loading, setLoading] = useState(false);
	const [tags, setTags] = useState([]);

	const { novel_id } = useLocalSearchParams();
	const navigation = useNavigation();

	// console.log(
	// 	"^_^ Log \n file: index.tsx:126 \n episodes:",
	// 	episodes[String(novel_id)],
	// 	"\n",
	// 	String(novel_id),
	// 	"\n",
	// 	Object.keys(episodes),
	// 	"\n"
	// );
	useFocusEffect(
		useCallback(() => {
			router.setParams({
				title: `「${novels[String(novel_id)]?.title}」` || "",
			});
			navigation.getParent()?.setOptions({ swipeEdgeWidth: 0 });
			return () => {
				navigation.getParent()?.setOptions({ swipeEdgeWidth: WindowWidth / 2 });
			};
		}, [])
	);

	useEffect(() => {
		if (session) getEpisodes();
	}, [session]);

	async function getEpisodes() {
		try {
			setLoading(true);
			if (session?.user.id === novels[String(novel_id)]?.user_id) {
				if (typeof novel_id !== "string")
					throw new Error("IDが文字列ではありません！");
				if (!session) throw new Error("sessionではありません！");
				const { data, error, status } = await supabase
					.from("episodes")
					.select("*")
					.eq("novel_id", novel_id)
					.order("updated_at", { ascending: false });
				if (error && status !== 406) {
					throw error;
				}
				if (data) {
					setEstates.persist({
						episodes: (cv) => {
							data.forEach((novel) => {
								if (!cv[novel_id]) {
									cv[novel_id] = {};
								}
								cv[novel_id][novel.id] = novel;
							});
							return Object.assign({}, cv);
						},
					});
				}
			}
		} catch (error) {
			if (error instanceof Error) {
				Alert.alert(error.message);
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={[styles.verticallySpaced, styles.mt20]}>
				<Button
					title={"Back"}
					onPress={() => router.back()}
					disabled={loading}
				/>
			</View>
			<View style={[styles.verticallySpaced, styles.mt20]}>
				<Button
					title={loading ? "Loading ..." : "追加"}
					onPress={() => createEpisode(String(novel_id), setLoading)}
					disabled={loading}
				/>
			</View>
			<View style={[styles.verticallySpaced, styles.mt20]}>
				<Button
					title={"作品を削除"}
					onPress={async () => {
						Alert.prompt(
							`「${novels[String(novel_id)].title}」を削除します`,
							`この操作は取り消すことができません。続行する場合はタイトルを入力してください。`,
							async (value) => {
								if (value === novels[String(novel_id)].title) {
									if (session) {
										try {
											const { error } = await supabase
												.from("novels")
												.delete()
												.eq("id", String(novel_id));
											if (error) {
												throw error;
											}
											router.back();
										} catch (error) {
											console.error(
												"^_^ Log \n file: index.tsx:186 \n error:",
												error
											);
										}
									}
									setEstate({
										novels: (cv) => {
											delete cv[String(novel_id)];
											return cv;
										},
									});
								} else {
									Alert.alert("タイトルが一致しません");
								}
							}
						);
					}}
					disabled={loading}
				/>
			</View>
			<View style={styles.verticallySpaced}>
				<Button title="Reload" onPress={getEpisodes} />
			</View>
			<SwipeableList
				getKey={(item) => item}
				items={novels[String(novel_id)]?.episodes_list || []}
				itemStyle={{ backgroundColor: "gray" }}
				onPress={(item) => {
					router.push({
						pathname: "/[novel_id]/[episode_id]",
						params: {
							novel_id,
							episode_id: item,
						},
					});
				}}
				onDelete={(item) => {
					const episode = episodes[String(novel_id)]?.[item];
					const episodeList = novels[episode.novel_id].episodes_list.filter(
						(value) => value !== item
					);
					if (episode) {
						setEstate({
							archive: (cv) => Object.assign({ [item]: episode }, cv),
							episodes: (cv) => {
								delete cv[String(novel_id)][item];
								return cv;
							},
							novels: (cv) => {
								cv[episode.novel_id].episodes_list = episodeList;
								return cv;
							},
						});
					}
					if (session) {
						supabase
							.from("episodes")
							.delete()
							.eq("id", item)
							.then(({ error }) => {
								if (error) {
								} else {
									supabase
										.from("novels")
										.update({ episodes_list: episodeList })
										.eq("id", String(novel_id))
										.then((res) => {
											console.log(
												"^_^ Log \n file: index.tsx:203 \n res:",
												res
											);
										});
								}
							});
					}
				}}
				onPositionChange={async (ap) => {
					setEstates.persist({
						novels: (cv) => {
							if (ap.length === cv[String(novel_id)]?.episodes_list?.length)
								cv[String(novel_id)].episodes_list = ap;
							return cv;
						},
					});
					if (session?.user) {
						await supabase
							.from("novels")
							.update({
								episodes_list: ap,
							})
							.eq("id", String(novel_id));
					}
				}}
				child={(item) => (
					<View style={{ padding: 10, height: "100%" }}>
						<Text
							style={{ fontSize: 20, marginBottom: 3 }}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{episodes[String(novel_id)]?.[item]
								? episodes[String(novel_id)][item].title
								: "Not Found"}
						</Text>
						<Text numberOfLines={1} ellipsizeMode="tail">
							{episodes[String(novel_id)]?.[item]?.text
								?.replace(/\n/g, "")
								.substring(0, 50)}
						</Text>
					</View>
				)}
				height={70}
			/>
		</SafeAreaView>
	);
}
const styles = StyleSheet.create({
	container: {
		marginTop: 40,
		padding: 12,
	},
	verticallySpaced: {
		paddingTop: 4,
		paddingBottom: 4,
		alignSelf: "stretch",
	},
	mt20: {
		marginTop: 20,
	},
});
