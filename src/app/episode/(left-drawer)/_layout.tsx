import Text from "@/components/CustomText";
import { useEstate } from "@/utils/estate";
import { Slot, router, useLocalSearchParams } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Alert, Dimensions, FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createEpisode } from "@/functions/createEpisode";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
const WindowWidth = Dimensions.get("window").width;

export default function HomeLayout() {
	return (
		<Drawer
			screenOptions={{
				headerShown: false,
				drawerActiveBackgroundColor: "transparent",
				drawerType: "front",
				swipeEdgeWidth: WindowWidth / 2,
				drawerStyle: { width: WindowWidth * 0.8, backgroundColor: "#000015" },
				// keyboardDismissMode: "none",
				sceneContainerStyle: { backgroundColor: "#000015" },
			}}
			drawerContent={LeftDrawer}
		>
			<Drawer.Screen name="[episode_id]" />
		</Drawer>
	);
}
const LeftDrawer = ({ navigation }: DrawerContentComponentProps) => {
	const { novel_id, episode_id } = useLocalSearchParams();
	console.log("^_^ Log \n file: _layout.tsx:30 \n episode_id:", episode_id);
	const { episodes, novels, setEstate } = useEstate("persist");
	return (
		<SafeAreaView
			style={{ borderRightWidth: 1, borderColor: "gray", flexGrow: 1 }}
		>
			<FlatList
				data={novels[String(novel_id)]?.episodes_list}
				renderItem={({ item }) => (
					<Pressable
						onPress={() => {
							router.replace({
								pathname: "/episode/[episode_id]",
								params: { novel_id, episode_id: item },
							});
							navigation.closeDrawer();
						}}
						style={{ padding: 10 }}
					>
						<Text
							style={{ fontSize: 20, marginBottom: 3 }}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{episodes[item]
								? episodes[item].title
								: "Not Found"}
						</Text>
						<Text numberOfLines={1} ellipsizeMode="tail">
							{episodes[item]?.text
								?.replace(/\n/g, "")
								.substring(0, 50)}
						</Text>
					</Pressable>
				)}
				ItemSeparatorComponent={({ highlighted }) => (
					<View
						style={[
							{ borderTopWidth: 1, borderColor: "gray" },
							highlighted && { marginLeft: 0 },
						]}
					/>
				)}
				ListFooterComponent={() => (
					<Pressable
						onPress={() => {
							Alert.prompt("エピソードの追加", undefined, (title) => {
								createEpisode({
									novel_id: String(novel_id),
									title,
									tags: ["system_episode"],
									// onLoading: setLoading,
								});
							});
						}}
						style={{ padding: 10, backgroundColor: "gray" }}
					>
						<Text
							style={{ fontSize: 20, marginBottom: 3 }}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							新規作成
						</Text>
					</Pressable>
				)}
			/>
		</SafeAreaView>
	);
};
