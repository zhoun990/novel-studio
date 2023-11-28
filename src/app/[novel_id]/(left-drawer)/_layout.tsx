import { Slot } from "expo-router";
import { Dimensions } from "react-native";
const WindowWidth = Dimensions.get("window").width;

export default function HomeLayout() {
	return (
		<Slot screenOptions={{ contentStyle: { backgroundColor: "black" } }} />
	);
}
