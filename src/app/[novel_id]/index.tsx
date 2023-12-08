import Text from "@/components/CustomText";
import { SwipeableList } from "@/components/Swipeable";
import { createEpisode } from "@/functions/createEpisode";
import { createGroupe } from "@/functions/createGroupe";
import { setEstates, useEstate } from "@/utils/estate";
import { n } from "@/utils/n";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useHeaderHeight } from "@react-navigation/elements";
import { BlurView } from "expo-blur";
import {
	router,
	useFocusEffect,
	useGlobalSearchParams,
	useLocalSearchParams,
	useNavigation,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActionSheetIOS,
	Alert,
	Dimensions,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import ContextMenu from "react-native-context-menu-view";
import { FlatList, ScrollView } from "react-native-gesture-handler";

const WindowWidth = Dimensions.get("window").width;
type TagProps = { [title: string]: string | number };
const tagEncoder = (props: TagProps) => {
	const keys = Object.keys(props);
	let tag = "";
	keys.forEach((key) => {
		key = encodeURIComponent(key);
		const value = encodeURIComponent(props[key]);
		if (tag) tag += `&&${key}=${value}`;
		else tag = `${key}=${value}`;
	});
	return tag;
};
const tagDecoder = (tag: string) => {
	const props: TagProps = {};
	tag.split("&&").forEach((prop) => {
		const key = decodeURIComponent(prop.split("=")[0]);
		const value = decodeURIComponent(prop.split("=")[1]);
		if (key && value) props[key] = value;
	});
	return props;
};

export default function Page() {
	const { session } = useEstate("main");
	const { episodes, novels, setEstate, episodeGroups, selectedGroupe } =
		useEstate("persist");
	const [loading, setLoading] = useState(false);
	const { novel_id } = useGlobalSearchParams();
	const navigation = useNavigation();
	const headerHeight = useHeaderHeight();
	const novel = novels[String(novel_id)];
	const selected = selectedGroupe[String(novel_id)];
	const isAuthor = session?.user.id === novels[String(novel_id)]?.user_id;

	useFocusEffect(
		useCallback(() => {
			navigation.getParent()?.setOptions({
				title: novels[String(novel_id)]?.title || "",
				headerRight: () => (
					<Pressable
						onPress={() => {
							if (loading) return;
							Alert.prompt(
								n({ default: "Add a new episode", jp: "エピソードの追加" }),
								undefined,
								async (title) => {
									createEpisode({
										novel_id: String(novel_id),
										title,
										tags: ["type_episode"],
										onLoading: setLoading,
									});
								}
							);
						}}
					>
						<Ionicons name="add" size={30} color="#F0F0F0" />
					</Pressable>
				),
			});
			// navigation.getParent()?.setOptions({ swipeEdgeWidth: 0 });
			return () => {
				navigation.getParent()?.setOptions({ swipeEdgeWidth: WindowWidth / 2 });
			};
		}, [])
	);

	useEffect(() => {
		if (isAuthor) {
			getEpisodes();
			getGroups();
		}
	}, [isAuthor]);

	async function getGroups() {
		try {
			// setLoading(true);
			if (isAuthor) {
				if (typeof novel_id !== "string")
					throw new Error("IDが文字列ではありません！");
				if (!session) throw new Error("sessionではありません！");
				const { data, error, status } = await supabase
					.from("episode_groups")
					.select("*")
					.eq("novel_id", novel_id)
					.order("updated_at", { ascending: false });
				if (error && status !== 406) {
					throw error;
				}
				if (data) {
					setEstates.persist({
						episodeGroups: (cv) => {
							data.forEach((groupe) => {
								cv[groupe.id] = groupe;
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
			// setLoading(false);
		}
	}
	async function getEpisodes() {
		try {
			setLoading(true);
			if (isAuthor) {
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
								cv[novel.id] = novel;
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
	if (!novel) return null;
	return (
		<View style={{ flex: 1 }}>
			<BlurView
				tint="dark"
				style={{
					position: "absolute",
					top: headerHeight,
					width: "100%",
					height: 50,
					zIndex: 1,
				}}
			>
				<FlatList
					data={novel.groups}
					initialScrollIndex={selected ? novel.groups?.indexOf(selected) : 0}
					showsHorizontalScrollIndicator={false}
					getItemLayout={(data, index) => {
						return {
							length: 40 + episodeGroups[novel.groups[index]].title.length * 20,
							offset: novel.groups.reduce((acc, v, i) => {
								if (i < index) {
									acc += 40 + episodeGroups[novel.groups[i]].title.length * 20;
								}
								return acc;
							}, 0), //90
							index,
						};
					}}
					renderItem={({ item }) => {
						if (!episodeGroups[item]) {
							return <View />;
						}
						return (
							<ContextMenu
								key={item}
								actions={[
									{ title: n({ default: "Rename", jp: "フォルダ名変更" }) },
									{
										title: n({ default: "Delete", jp: "フォルダ名変更" }),
										destructive: true,
									},
								]}
								onPress={({ nativeEvent }) => {
									switch (nativeEvent.index) {
										case 0:
											Alert.prompt(
												n({
													default: "Rename the folder",
													jp: "フォルダ名を変更",
												}),
												"",
												async (title) => {
													try {
														if (
															session?.user?.id ===
															novels[String(novel_id)].user_id
														) {
															const { error } = await supabase
																.from("episode_groups")
																.update({
																	title,
																})
																.eq("id", item);
															if (error) {
																throw error;
															}
														}
														setEstate({
															episodeGroups: (cv) => {
																cv[item].title = title;
																return cv;
															},
														});
													} catch (error) {
														console.error(
															"^_^ Log \n file: Account.tsx:69 \n error:",
															error
														);
														if (error instanceof Error) {
															Alert.alert(error.message);
														}
													}
												},
												undefined,
												episodeGroups[item].title || ""
											);
											break;
										case 1:
											Alert.alert(
												n({
													default: "Delete the folder",
													jp: "フォルダーを削除",
												}),
												n({
													default:
														"Are you sure you want to delete this folder?\nNote that the episodes contained in the folder will not be deleted. If you wish to delete episodes, please delete it individually.",
													jp: "本当にこのフォルダーを削除してよろしいですか？\n※フォルダーに含まれるエピソードは削除されません。エピソードを削除したい場合は個別に削除して下さい。",
												}),
												[
													{ text: "Cancel", style: "cancel" },
													{
														text: "Delete",
														style: "destructive",
														onPress: async () => {
															try {
																if (
																	session?.user?.id ===
																	novels[String(novel_id)].user_id
																) {
																	const { error } = await supabase
																		.from("episode_groups")
																		.delete()
																		.eq("id", item)
																		.then(async (props) => {
																			const { error } = await supabase
																				.from("novels")
																				.update({
																					groups: novel.groups.filter(
																						(groupe) => groupe !== item
																					),
																				})
																				.eq("id", item);
																			return {
																				...props,
																				error: error || props.error,
																			};
																		});
																	if (error) {
																		throw error;
																	}
																}
																setEstate({
																	episodeGroups: (cv) => {
																		delete cv[item];
																		return cv;
																	},
																	novels: (cv) => {
																		cv[String(novel_id)].groups = cv[
																			String(novel_id)
																		].groups.filter(
																			(groupe) => groupe !== item
																		);
																		return cv;
																	},
																});
															} catch (error) {
																console.error(
																	"^_^ Log \n file: Account.tsx:69 \n error:",
																	error
																);
																if (error instanceof Error) {
																	Alert.alert(error.message);
																}
															}
														},
													},
												]
											);
											break;

										default:
											break;
									}
								}}
								previewBackgroundColor="transparent"
							>
								<Pressable
									onPress={() => {
										setEstates.persist({
											selectedGroupe: (cv) => {
												cv[String(novel_id)] = item;
												return cv;
											},
										});
									}}
									style={{
										justifyContent: "center",
										alignItems: "center",
										backgroundColor: "#000030",
										borderRadius: 100,
										marginLeft: 10,
										borderWidth: 2,
										borderColor: selected === item ? "white" : "#000030",
										height: 40,
										width: 30 + episodeGroups[item].title.length * 20,
										overflow: "hidden",
									}}
								>
									<Text style={{ fontSize: 20 }} ellipsizeMode="tail">
										{episodeGroups[item].title}
									</Text>
								</Pressable>
							</ContextMenu>
						);
					}}
					horizontal
					ListHeaderComponent={() => (
						<ContextMenu
							// actions={[{ title: "Title 1" }, { title: "Title 2" }]}
							previewBackgroundColor="transparent"
						>
							<Pressable
								onPress={() => {
									setEstates.persist({
										selectedGroupe: (cv) => {
											cv[String(novel_id)] = null;
											return cv;
										},
									});
								}}
								style={{
									justifyContent: "center",
									alignItems: "center",
									backgroundColor: "#000030",
									borderRadius: 100,
									marginLeft: 10,
									borderWidth: 2,
									borderColor: !selected ? "white" : "#000030",
									height: 40,
									width: 80,
								}}
							>
								<Text style={{ fontSize: 20 }}>
									{n({ default: "All", jp: "全て" })}
								</Text>
							</Pressable>
						</ContextMenu>
					)}
					ListFooterComponent={() => (
						<Pressable
							onPress={() => {
								if (loading) return;
								Alert.prompt(
									n({ default: "Create a new folder", jp: "フォルダを作成" }),
									undefined,
									async (title) => {
										createGroupe({
											novel_id: String(novel_id),
											title,
											onLoading: setLoading,
										});
									}
								);
							}}
							style={{
								// height: "100%",
								paddingHorizontal: 10,
								justifyContent: "center",
								alignItems: "center",
								backgroundColor: "#000030",
								borderRadius: 100,
								marginHorizontal: 10,
								flexDirection: "row",
								height: 40,
							}}
						>
							<Ionicons name="add" size={30} color="#F0F0F0" />
							{!novel.groups && (
								<Text>{n({ default: "New Folder", jp: "フォルダ" })}</Text>
							)}
						</Pressable>
					)}
					contentContainerStyle={{ alignItems: "center" }}
				/>
			</BlurView>
			<SwipeableList
				dndEnabled
				removeEnabled
				containerStyle={{ paddingTop: headerHeight + 50 }}
				keyExtractor={(item) => item}
				data={
					(selected
						? episodeGroups[selected]?.episodes_list
						: novels[String(novel_id)]?.episodes_list) || []
				}
				id={String(selected)}
				itemStyle={{ backgroundColor: "#000015" }}
				onPressItem={(item) => {
					router.push({
						pathname: "/episode/[episode_id]",
						params: {
							novel_id,
							episode_id: item,
						},
					});
				}}
				onDeleteItem={(item) => {
					const episode = episodes[item];
					const episodeList = novels[episode.novel_id].episodes_list.filter(
						(value) => value !== item
					);
					const groupeList = selected
						? episodeGroups[selected].episodes_list.filter(
								(value) => value !== item
						  )
						: [];
					if (episode) {
						setEstate({
							archive: (cv) => Object.assign({ [item]: episode }, cv),
							episodes: (cv) => {
								delete cv[item];
								return cv;
							},
							novels: (cv) => {
								cv[episode.novel_id].episodes_list = episodeList;
								return cv;
							},
							episodeGroups: (cv) => {
								if (selected && cv[selected]) {
									cv[selected].episodes_list = groupeList;
								}
								return cv;
							},
						});
					}
					if (isAuthor) {
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
									if (selected && episodeGroups[selected]) {
										supabase
											.from("episode_groups")
											.update({ episodes_list: groupeList })
											.eq("id", selected)
											.then((res) => {
												console.log(
													"^_^ Log \n file: index.tsx:203 \n res:",
													res
												);
											});
									}
								}
							});
					}
				}}
				onPositionChange={async (ap) => {
					if (selected) {
						setEstates.persist({
							episodeGroups: (cv) => {
								if (ap.length === cv[String(selected)]?.episodes_list?.length)
									cv[String(selected)].episodes_list = ap;
								return cv;
							},
						});
						if (isAuthor) {
							await supabase
								.from("episode_groups")
								.update({
									episodes_list: ap,
								})
								.eq("id", selected);
						}
					} else {
						setEstates.persist({
							novels: (cv) => {
								if (ap.length === cv[String(novel_id)]?.episodes_list?.length)
									cv[String(novel_id)].episodes_list = ap;
								return cv;
							},
						});
						if (isAuthor) {
							await supabase
								.from("novels")
								.update({
									episodes_list: ap,
								})
								.eq("id", String(novel_id));
						}
					}
				}}
				renderItem={(item) => (
					<ContextMenu
						style={{ padding: 10, height: "100%" }}
						previewBackgroundColor="transparent"
						actions={[
							{ title: n({ default: "Move Folder", jp: "フォルダーを移動" }) },
							{
								title: n({
									default: "Pull out of folder",
									jp: "フォルダーから出す",
								}),
							},
						]}
						onPress={({ nativeEvent }) => {
							switch (nativeEvent.index) {
								case 0:
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
												setEstate({
													episodeGroups: (cv) => {
														const currentGroupe = episodes[item].groupe;
														if (currentGroupe)
															cv[currentGroupe].episodes_list = cv[
																currentGroupe
															].episodes_list.filter((id) => id !== item);
														cv[novel.groups[i]].episodes_list.push(item);
														return cv;
													},
													episodes: (cv) => {
														cv[item].groupe = novel.groups[i];
														return cv;
													},
												});
											}
										}
									);
									break;
								case 1:
									setEstate({
										episodeGroups: (cv) => {
											const currentGroupe = episodes[item].groupe;
											if (currentGroupe)
												cv[currentGroupe].episodes_list = cv[
													currentGroupe
												].episodes_list.filter((id) => id !== item);
											return cv;
										},
										episodes: (cv) => {
											cv[item].groupe = null;
											return cv;
										},
									});
									break;

								default:
									break;
							}
						}}
					>
						<Text
							style={{ fontSize: 20, marginBottom: 3 }}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{episodes[item] ? episodes[item].title : "Not Found"}
						</Text>
						<Text numberOfLines={1} ellipsizeMode="tail">
							{episodes[item]?.text?.replace(/\n/g, "").substring(0, 50)}
						</Text>
					</ContextMenu>
				)}
				itemHeight={70}
			/>
		</View>
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
