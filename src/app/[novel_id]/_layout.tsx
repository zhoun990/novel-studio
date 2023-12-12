import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Image, StyleSheet } from "react-native";

export default function HomeLayout() {
	return (
		<Tabs
			sceneContainerStyle={{ backgroundColor: "#000015" }}
			screenOptions={{
				//   tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				tabBarStyle: { position: "absolute" },
				tabBarBackground: () => (
					<BlurView
						tint="dark"
						intensity={50}
						style={StyleSheet.absoluteFill}
					/>
				),
				headerTransparent: true,
				headerBackground: () => (
					<BlurView
						tint="dark"
						intensity={50}
						style={StyleSheet.absoluteFill}
					/>
				),
				headerTitle: () => (
					<Image
						source={require("assets/white_title.png")}
						style={{ height: 20, width: 191 }}
						resizeMode="contain"
					/>
				),
			}}
		>
			{/* <Tabs.Screen
			name="(drawer)/[novel_id]/[episode_id]/(left-drawer)/index"
			options={{
				// title: String(params.title || ""),
				// headerShown: false,
				href: null,
			}}
		/> */}

			<Tabs.Screen
				name="about"
				options={{
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="index"
				options={{
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="plots"
				options={{
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="docs"
				options={{
					headerShown: false,
				}}
			/>
		</Tabs>
	);
}
