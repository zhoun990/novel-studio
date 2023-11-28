import { Drawer } from "expo-router/drawer";
import { Dimensions } from "react-native";

const WindowWidth = Dimensions.get("window").width;

export default function Layout() {
	return (
		<Drawer
			screenOptions={{
				headerShown: false,
				// gestureEnabled: false
				drawerPosition: "right",
				drawerType: "front",
				swipeEdgeWidth: WindowWidth / 2,
				drawerStyle: { width: WindowWidth * 0.8 },
				keyboardDismissMode: "none",
			}}
		>
			<Drawer.Screen name="[novel_id]" options={{ }} />
		</Drawer>
	);
}
