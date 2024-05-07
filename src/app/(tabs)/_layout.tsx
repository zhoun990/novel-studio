import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Image, StyleSheet } from "react-native";
export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        //   tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: { position: "absolute" },
        tabBarBackground: () => (
          <BlurView tint="dark" intensity={50} style={StyleSheet.absoluteFill} />
        ),
        headerTransparent: true,
        headerBackground: () => (
          <BlurView tint="dark" intensity={50} style={StyleSheet.absoluteFill} />
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
        name="index"
        options={{
          headerShown: false,
          // tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          // headerRight: () => (
          //   <Link href="/modal" asChild>
          // 	<Pressable>
          // 	  {({ pressed }) => (
          // 		<FontAwesome
          // 		  name="info-circle"
          // 		  size={25}
          // 		  color={Colors[colorScheme ?? "light"].text}
          // 		  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          // 		/>
          // 	  )}
          // 	</Pressable>
          //   </Link>
          // ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          // tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </Tabs>
  );
}
