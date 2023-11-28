import Text from "@/components/CustomText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { Alert, Button, FlatList, Pressable, View, Image } from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import "react-native-url-polyfill/auto";
import { clearEstate, setEstates, useEstate } from "@/utils/estate";
import { supabase } from "@/utils/supabase";
import Auth from "../auth";
import { BlurView } from "expo-blur";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";

async function createNovel(
	onLoading: (isLoading: boolean) => void,
	local = false
) {
	Alert.prompt("作品の追加", undefined, async (title) => {
		try {
			onLoading(true);
			if (!title) throw new Error("タイトルが入力されていません");
			setEstates.persist({
				novels: async (cv, _, { main }) => {
					if (!local && main.session?.user) {
						const { error, data } = await supabase
							.from("novels")
							.insert({
								title,
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
	});
}
let c = 0;
export default function App() {
	c++;
	const { session } = useEstate("main");
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { novels, setEstate, signinRecomendation } = useEstate("persist");

	useEffect(() => {
		if (session?.user) getNovels();
	}, [session]);

	async function getNovels() {
		if (session?.user) {
			try {
				setLoading(true);
				const { data, error, status } = await supabase
					.from("novels")
					.select("*")
					.eq("user_id", session.user.id)
					.order("updated_at", { ascending: false });
				if (error && status !== 406) {
					throw error;
				}

				if (data && data.length) {
					const newNovels = {} as typeof novels;
					data.forEach((novel) => {
						newNovels[novel.id] = {
							...novel,
							synced_at: new Date().toISOString(),
						};
					});
					setEstate({ novels: (cv) => ({ ...cv, ...newNovels }) });
				}
			} catch (error) {
				console.error("^_^ Log \n file: Account.tsx:38 \n error:", error);
				if (error instanceof Error) {
					Alert.alert(error.message);
				}
			} finally {
				setLoading(false);
			}
		}
		setTimeout(() => {
			setRefreshing(false);
		}, 2000);
	}
	const { top } = useSafeAreaInsets();
	const headerHeight = useHeaderHeight();
	if (!signinRecomendation && !session?.user) {
		return <Auth />;
	}
	return (
		<View style={{ flex: 1, position: "relative", backgroundColor: "#000015" }}>
			{/* <SafeAreaView>
				{session?.user && (
					<View
						style={[
							{ paddingTop: 4, paddingBottom: 4, alignSelf: "stretch" },
							{ marginTop: 20 },
						]}
					>
						<Input label="Email" value={session?.user?.email} disabled />
					</View>
				)}
				<View
					style={[
						{
							paddingTop: 4,
							paddingBottom: 4,
							alignSelf: "stretch",
							flexDirection: "row",
							justifyContent: "center",
						},
						{ marginTop: 20 },
					]}
				>
					{session && (
						<Button
							title={loading ? "Loading ..." : "書き始める"}
							onPress={() => createNovel(setLoading)}
							disabled={loading}
						/>
					)}
					<Button
						title={"ローカルで書き始める"}
						onPress={() => createNovel(setLoading, true)}
						disabled={loading}
					/>
				</View>
			</SafeAreaView> */}
			<FlatList
				style={{
					flexGrow: 1,
					width: "100%",
					paddingBottom: 200,
					paddingTop:  headerHeight,
				}}
				progressViewOffset={headerHeight}
				data={Object.values(novels)
					.filter((b) => new Date(b.updated_at).getTime())
					.sort(
						(a, b) =>
							new Date(b.updated_at).getTime() -
							new Date(a.updated_at).getTime()
					)}
				ItemSeparatorComponent={({ highlighted }) => (
					<View
						style={[
							{ borderTopWidth: 1, borderColor: "gray" },
							highlighted && { marginLeft: 0 },
						]}
					/>
				)}
				renderItem={({ item }) => (
					<Pressable
						onPress={() => {
							router.push({
								pathname: "/[novel_id]",
								params: { novel_id: item.id },
							});
						}}
						style={{
							padding: 10,
							paddingVertical: 5,
							backgroundColor: "#000015",
						}}
					>
						<Text
							style={{ fontSize: 22, marginVertical: 4, fontWeight: "bold" }}
						>
							{item.title}
						</Text>
						<Text style={{ fontSize: 18, marginHorizontal: 4, color: "gray" }}>
							{item.description || "no text"}
						</Text>

						<View
							style={{
								flexDirection: "row",
							}}
						>
							<View style={{ flexGrow: 1 }}>
								<Text style={{ marginLeft: 4, color: "gray" }}>
									{item.episodes_list?.length}エピソード
								</Text>
							</View>

							<Text style={{ marginRight: 5, color: "gray" }}>
								{item.updated_at &&
									(() => {
										const diff =
											new Date().getTime() -
											new Date(item.updated_at).getTime();
										const seconds = Math.floor(diff / 1000);

										const minutes = Math.floor(seconds / 60);
										const hours = Math.floor(minutes / 60);
										const days = Math.floor(hours / 24);
										if (days > 0) return `${days}日前`;
										if (hours > 0) return `${hours}時間前`;
										if (minutes > 0) return `${minutes}分前`;
										return "たった今";
									})()}
							</Text>
							{item.user_id ? (
								<Ionicons name="cloud-done" size={17} color="green" />
							) : (
								<Ionicons name="save" size={15} color="gray" />
							)}
						</View>
					</Pressable>
				)}
				// onRefresh={() => {
				// 	console.log("reflesh");
				// 	setRefreshing(true);
				// 	getNovels();
				// }}
				refreshing={refreshing}
				indicatorStyle="white"
			/>
		
		</View>
	);
}
const BlurHeader = ({
	left,
	mid,
	right,
	tint = "dark",
}: {
	left?: ReactNode;
	mid?: ReactNode;
	right?: ReactNode;
	tint?: BlurView["props"]["tint"];
}) => {
	const { top } = useSafeAreaInsets();

	return (
		<BlurView
			intensity={50}
			tint="dark"
			style={{
				position: "absolute",
				paddingTop: top,
				width: "100%",
				top: 0,
				left: 0,
				zIndex: 100,
			}}
		>
			<View
				style={{
					height: 45,
					width: "100%",
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<View style={{ flexGrow: 1 }}>{left}</View>
				<View>{mid}</View>
				<View style={{ flexGrow: 1, justifyContent: "flex-end" }}>{right}</View>
			</View>
		</BlurView>
	);
};
