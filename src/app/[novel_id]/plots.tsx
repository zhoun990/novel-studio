import Text from "@/components/CustomText";
import TextInput from "@/components/CustomTextInput";
import { createPlot } from "@/functions/createPlot";
import { createPlotGroupe } from "@/functions/createPlotGroupe";
import { setEstates, setPlot, useEstate } from "@/utils/estate";
import { n } from "@/utils/n";
import { supabase } from "@/utils/supabase";
import { Plot } from "@/utils/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { BlurView } from "expo-blur";
import {
	useFocusEffect,
	useGlobalSearchParams,
	useNavigation,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActionSheetIOS,
	Alert,
	Dimensions,
	KeyboardAvoidingView,
	Pressable,
	View,
} from "react-native";
import ContextMenu from "react-native-context-menu-view";
import DraggableFlatList, {
	ScaleDecorator,
} from "react-native-draggable-flatlist";
import { FlatList } from "react-native-gesture-handler";
const WindowWidth = Dimensions.get("window").width;

export default function Page() {
	const { session } = useEstate("main");
	const { plots, novels, setEstate, plotGroups, selectedPlotGroupe } =
		useEstate("persist");
	const [loading, setLoading] = useState(false);
	const { novel_id } = useGlobalSearchParams();
	const navigation = useNavigation();
	const headerHeight = useHeaderHeight();
	const novel = novels[String(novel_id)];
	const selected = selectedPlotGroupe[String(novel_id)];
	const isAuthor = session?.user.id === novel?.user_id;
	const bottomTabHeight = useBottomTabBarHeight();

	useFocusEffect(
		useCallback(() => {
			navigation.getParent()?.setOptions({
				title: novel.title || "",
				headerRight: null,
			});
		}, [])
	);

	useEffect(() => {
		if (isAuthor) {
			getEpisodes();
			getPlotGroups();
		}
	}, [isAuthor]);
	useEffect(() => {
		if (
			selected &&
			(!plotGroups[selected].plots.length ||
				plots[plotGroups[selected]?.plots?.concat()?.pop() || ""].text)
		) {
			createPlot({ novel_id: String(novel_id) });
		}
	}, [
		plotGroups[selected || ""]?.plots,
		plots[plotGroups[selected || ""]?.plots?.concat()?.pop() || ""]?.text,
	]);

	async function getPlotGroups() {
		try {
			// setLoading(true);
			if (isAuthor) {
				if (typeof novel_id !== "string")
					throw new Error("IDが文字列ではありません！");
				if (!session) throw new Error("sessionではありません！");
				const { data, error, status } = await supabase
					.from("plot_groups")
					.select("*")
					.eq("novel_id", novel_id)
					.order("updated_at", { ascending: false });
				if (error && status !== 406) {
					throw error;
				}
				if (data) {
					setEstates.persist({
						plotGroups: (cv) => {
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
					.from("plots")
					.select("*")
					.eq("novel_id", novel_id)
					.order("updated_at", { ascending: false });
				if (error && status !== 406) {
					throw error;
				}
				if (data) {
					setEstates.persist({
						plots: (cv) => {
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
	const onDeleteItem = (item: string, selected: string) => {
		const plot = plots[item];
		const plot_groups = novels[String(novel_id)].plot_groups.filter(
			(value) => value !== item
		);
		const groupeList = plotGroups[selected].plots.filter(
			(value) => value !== item
		);
		if (plot) {
			setEstate({
				plots: (cv) => {
					delete cv[item];
					return Object.assign({}, cv);
				},
				novels: (cv) => {
					cv[String(novel_id)].plot_groups = plot_groups;
					return Object.assign({}, cv);
				},
				plotGroups: (cv) => {
					if (cv[selected]) {
						cv[selected].plots = groupeList;
					}
					return Object.assign({}, cv);
				},
			});
		}
		if (isAuthor) {
			supabase
				.from("plots")
				.delete()
				.eq("id", item)
				.then(({ error }) => {
					if (error) {
					} else {
						supabase
							.from("novels")
							.update({ plot_groups: plot_groups })
							.eq("id", String(novel_id))
							.then((res) => {
								console.log("^_^ Log \n file: index.tsx:203 \n res:", res);
							});
						if (plotGroups[selected]) {
							supabase
								.from("plot_groups")
								.update({ plots: groupeList })
								.eq("id", selected)
								.then((res) => {
									console.log("^_^ Log \n file: index.tsx:203 \n res:", res);
								});
						}
					}
				});
		}
	};
	if (!novel) return null;
	return (
		<KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
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
				<DraggableFlatList
					data={novel.plot_groups}
					keyExtractor={(item) => item}
					initialScrollIndex={Math.max(
						0,
						selected &&
							novel.plot_groups.reduce((acc, v, i) => {
								acc += 40 + plotGroups[novel.plot_groups[i]].title.length * 20;

								return acc;
							}, 0) > WindowWidth
							? novel.plot_groups?.indexOf(selected)
							: 0
					)}
					showsHorizontalScrollIndicator={false}
					getItemLayout={(data, index) => {
						return {
							length:
								40 + plotGroups[novel.plot_groups[index]].title.length * 20,
							offset: novel.plot_groups.reduce((acc, v, i) => {
								if (i < index) {
									acc +=
										40 + plotGroups[novel.plot_groups[i]].title.length * 20;
								}
								return acc;
							}, 0), //90
							index,
						};
					}}
					renderItem={({ item }) => {
						return (
							<ContextMenu
								key={item}
								actions={[
									{ title: n({ default: "Rename", jp: "グループ名変更" }) },
									{
										title: n({ default: "Delete", jp: "グループ削除" }),
										destructive: true,
									},
								]}
								onPress={({ nativeEvent }) => {
									switch (nativeEvent.index) {
										case 0:
											Alert.prompt(
												n({
													default: "Rename the groupe",
													jp: "グループ名を変更",
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
															plotGroups: (cv) => {
																cv[item].title = title;
																return Object.assign({},cv);
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
												plotGroups[item].title || ""
											);
											break;
										case 1:
											Alert.alert(
												n({
													default: "Delete the groupe",
													jp: "グループを削除",
												}),
												n({
													default:
														"Are you sure you want to delete this groupe?\nNote that the plots contained in the groupe will not be deleted. If you wish to delete plots, please delete it individually.",
													jp: "本当にこのグループを削除してよろしいですか？\n※グループに含まれるプロットは削除されません。プロットを削除したい場合は個別に削除して下さい。",
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
																		.from("plot_groups")
																		.delete()
																		.eq("id", item)
																		.then(async (props) => {
																			const { error } = await supabase
																				.from("novels")
																				.update({
																					plot_groups: novel.plot_groups.filter(
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
																	plotGroups: (cv) => {
																		delete cv[item];
																		return cv;
																	},
																	novels: (cv) => {
																		cv[String(novel_id)].plot_groups = cv[
																			String(novel_id)
																		].plot_groups.filter(
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
									onPress={() => {console.log("press");

										setEstates.persist({
											selectedPlotGroupe: (cv) => {
												cv[String(novel_id)] = item;
												return Object.assign({},cv);
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
										width: 30 + plotGroups[item]?.title.length * 20,
										overflow: "hidden",
									}}
								>
									<Text style={{ fontSize: 20 }} ellipsizeMode="tail">
										{plotGroups[item]?.title}
									</Text>
								</Pressable>
							</ContextMenu>
						);
					}}
					horizontal
					ListFooterComponent={() => (
						<Pressable
							onPress={() => {
								if (loading) return;
								Alert.prompt(
									n({
										default: "Create a new plot groupe",
										jp: "プロットグループを作成",
									}),
									undefined,
									async (title) => {
										createPlotGroupe({
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
							{!novel.plot_groups && (
								<Text>
									{n({ default: "New Plot Groupe", jp: "プロットグループ" })}
								</Text>
							)}
						</Pressable>
					)}
					contentContainerStyle={{ alignItems: "center" }}
				/>
			</BlurView>
			{selected && (
				<DraggableFlatList
					style={{ paddingTop: headerHeight + 50 }}
					keyExtractor={(item) => item}
					data={plotGroups[selected].plots || []}
					id={String(selected)}
					onDragEnd={async ({ data }) => {
						setEstates.persist({
							plotGroups: (cv) => {
								cv[String(selected)].plots = data;
								return cv;
							},
						});
						if (isAuthor) {
							await supabase
								.from("plot_groups")
								.update({
									plots: data,
								})
								.eq("id", selected);
						}
					}}
					renderItem={({ item, drag, isActive }) => (
						<ScaleDecorator>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									borderBottomWidth: 1,
									borderColor: "gray",
									backgroundColor: "#000015",
								}}
							>
								<ContextMenu
									// style={{ padding: 10, height: "100%", backgroundColor: "blue" }}
									style={{
										flexGrow: 1,
									}}
									previewBackgroundColor="transparent"
									actions={[
										{
											title: n({
												default: "Move to",
												jp: "グループを移動",
											}),
										},
										{
											title: n({
												default: "Delete",
												jp: "削除",
											}),
											destructive: true,
										},
									]}
									onPress={({ nativeEvent }) => {
										switch (nativeEvent.index) {
											case 0:
												ActionSheetIOS.showActionSheetWithOptions(
													{
														options: [
															"Cancel",

															...novel.plot_groups.map(
																(id) => plotGroups[id].title
															),
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
																plotGroups: (cv) => {
																	const currentGroupe =
																		plots[item].plot_groupe_id;
																	if (currentGroupe)
																		cv[currentGroupe].plots = cv[
																			currentGroupe
																		].plots.filter((id) => id !== item);
																	const target = cv[novel.plot_groups[i]];
																	if (
																		!plots[target?.plots?.concat()?.pop() || ""]
																			.text
																	)
																		target.plots.pop();
																	target.plots.push(item);

																	return cv;
																},
																plots: (cv) => {
																	cv[item].plot_groupe_id =
																		novel.plot_groups[i];
																	return cv;
																},
															});
														}
													}
												);
												break;
											case 1:
												onDeleteItem(item, selected);
												break;
											default:
												break;
										}
									}}
								>
									<View
										style={{
											padding: 10,
											paddingVertical: 20,
										}}
									>
										<ProtEditor plots={plots} item={item} />
									</View>
								</ContextMenu>
								<Pressable onPressIn={drag} style={{ paddingHorizontal: 20 }}>
									<Ionicons
										name="reorder-three-outline"
										size={40}
										color="#F0F0F0"
									/>
								</Pressable>
							</View>
						</ScaleDecorator>
					)}
					ListFooterComponent={() => (
						<View style={{ height: bottomTabHeight + headerHeight + 50 }} />
					)}
				/>
			)}
		</KeyboardAvoidingView>
	);
}
const ProtEditor = ({
	plots,
	item,
}: {
	plots: Record<string, Plot>;
	item: string;
}) => {
	const [text, setText] = useState(plots[item]?.text);
	useEffect(() => {
		setPlot(item, (cv) => ({ ...cv, text }));
	}, [text]);
	return (
		<TextInput value={text} onChangeText={setText} style={{ fontSize: 18 }} />
	);
};
