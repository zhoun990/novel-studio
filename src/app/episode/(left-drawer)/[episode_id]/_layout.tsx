import Text from "@/components/CustomText";
import { useEstate } from "@/utils/estate";
import { Slot, router, useLocalSearchParams } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Dimensions, FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createEpisode } from "@/functions/createEpisode";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
const WindowWidth = Dimensions.get("window").width;

export default function HomeLayout() {
	return (
		<Slot
			screenOptions={{
				// contentStyle: { backgroundColor: "#000015" },
			}}
		/>
	);
}
