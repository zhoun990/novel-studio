import Text from "@/components/CustomText";
import TextInput from "@/components/CustomTextInput";
import { createEpisode } from "@/functions/createEpisode";
import { setNovel, useEstate } from "@/utils/estate";
import { n } from "@/utils/n";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useHeaderHeight } from "@react-navigation/elements";
import {
	router,
	useFocusEffect,
	useGlobalSearchParams,
	useNavigation,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	Alert,
	Dimensions,
	Pressable,
	View,
	KeyboardAvoidingView,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const WindowWidth = Dimensions.get("window").width;
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { supabase } from "@/utils/supabase";

export default function Page() {
	const { session } = useEstate("main");
	const { episodes, novels, setEstate, episodeGroups, selectedGroupe } =
		useEstate("persist");
	const { novel_id } = useGlobalSearchParams();
	const novel = novels[String(novel_id)];
	const [loading, setLoading] = useState(false);
	const [title, setTitle] = useState(novel.title);
	const [note, setNote] = useState(novel.note || "");
	const [description, setDescription] = useState(novel.description || "");
	console.log("^_^ Log \n file: index.tsx:50 \n novel_id:", novel_id);
	const navigation = useNavigation();
	const headerHeight = useHeaderHeight();
	const selected = selectedGroupe[String(novel_id)];
	const isAuthor = session?.user.id === novels[String(novel_id)]?.user_id;
	const bottomTabHeight = useBottomTabBarHeight();

	useFocusEffect(
		useCallback(() => {
			navigation.getParent()?.setOptions({
				title: n({ default: "About", jp: "作品概要" }),
				headerRight: null,
			});
			// navigation.getParent()?.setOptions({ swipeEdgeWidth: 0 });
			return async () => {
				setNovel(novel_id, (cv) => ({
					...cv,
					title,
					description,
					note,
					updated_at: new Date().toISOString(),
				}));
				if (session?.user?.id === novels[String(novel_id)].user_id) {
					const { error, data } = await supabase
						.from("novels")
						.update({
							title,
							description,
							note,
						})
						.eq("id", String(novel_id))
						.select("*");
					console.log("^_^ Log \n file: about.tsx:56 \n data:", data);

					if (error) {
						throw error;
					}
				}
			};
		}, [title, description, note])
	);
	return (
		<KeyboardAvoidingView
			behavior="padding"
			style={{
				flex: 1,
				// paddingTop: headerHeight,
				// paddingBottom: bottomTabHeight,
			}}
		>
			<ScrollView
				style={{
					flex: 1,
					paddingTop: headerHeight,
				}}
			>
				<TextInput
					value={title}
					onChangeText={setTitle}
					style={{ fontSize: 25, margin: 10, textAlign: "center" }}
					placeholder={n({ default: "Title of this Novel", jp: "作品の題名" })}
					placeholderTextColor={"gray"}
				/>
				<TextInput
					value={description}
					onChangeText={setDescription}
					style={{ fontSize: 20, margin: 10, textAlign: "center" }}
					multiline
					placeholder={n({ default: "description text", jp: "作品の説明" })}
					placeholderTextColor={"gray"}
					scrollEnabled={false}
				/>
				<Text style={{ fontSize: 18, marginTop: 20, marginLeft: 30 }}>
					{n({ default: "Note", jp: "作品メモ" })}
				</Text>
				<TextInput
					value={note}
					onChangeText={setNote}
					style={{
						fontSize: 20,
						margin: 20,
						backgroundColor: "#000030",
						borderRadius: 10,
						minHeight: 100,
						padding: 10,
						marginTop: 5,
					}}
					multiline
					scrollEnabled={false}
				/>
				<Pressable
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
					style={{
						borderWidth: 1,
						borderColor: "red",
						padding: 10,
						borderRadius: 20,
						marginHorizontal: 20,
					}}
				>
					<Text style={{ textAlign: "center", color: "red" }}>
						{n({ default: "Delete this Novel", jp: "作品を削除" })}
					</Text>
				</Pressable>

				<View style={{ height: bottomTabHeight + headerHeight }} />
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
