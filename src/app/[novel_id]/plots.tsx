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
	useLocalSearchParams,
	useNavigation,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Dimensions, Pressable, StyleSheet, View } from "react-native";
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
	const { novel_id } = useLocalSearchParams();
	const navigation = useNavigation();
	const headerHeight = useHeaderHeight();
	const novel = novels[String(novel_id)];
	const selected = selectedGroupe[String(novel_id)];
	const isAuthor = session?.user.id === novels[String(novel_id)]?.user_id;
	return (
		<View style={{ flex: 1, paddingTop: headerHeight }}>
			<Text>作品詳細</Text>
		</View>
	);
}
