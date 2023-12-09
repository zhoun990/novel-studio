import {
	SplashScreen,
	Redirect,
	Slot,
	Stack,
	router,
	useGlobalSearchParams,
	useLocalSearchParams,
	usePathname,
} from "expo-router";
import { Asset, useAssets } from "expo-asset";
import Constants from "expo-constants";
import { clearEstate, useEstate } from "@/utils/estate";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Auth from "@/components/Auth";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import * as Font from "expo-font";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Animated, View, StyleSheet, Image, Alert } from "react-native";
import { StatusBar, setStatusBarStyle } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { Pressable } from "react-native";
import { n } from "../utils/n";
import Text from "@/components/CustomText";
import { createNovel } from "@/functions/createNovel";
import { createEpisode } from "@/functions/createEpisode";
import {
	NotoSansJP_400Regular,
	NotoSansJP_700Bold,
	NotoSansJP_500Medium,
} from "@expo-google-fonts/noto-sans-jp";
import { NotoSerifJP_400Regular } from "@expo-google-fonts/noto-serif-jp";
import { GothicA1_400Regular } from "@expo-google-fonts/gothic-a1";
import { Roboto_400Regular } from "@expo-google-fonts/roboto";
SplashScreen.preventAutoHideAsync();

function cacheFonts(fonts: any[]) {
	return fonts.map((font) => Font.loadAsync(font));
}
export default function Layout() {
	const { session, setEstate, title, description, loading } = useEstate("main");
	const pathname = usePathname();
	const params = useGlobalSearchParams();

	useEffect(() => {
		// setStatusBarStyle("light");
		supabase.auth.getSession().then(({ data: { session } }) => {
			setEstate({ session });
		});

		const { data } = supabase.auth.onAuthStateChange((_event, session) => {
			setEstate({ session });
		});
		return () => {
			data.subscription.unsubscribe();
		};
	}, []);
	// You can keep the splash screen open, or render a loading screen like we do here.
	//   if (isLoading) {
	//     return <Text>Loading...</Text>;
	//   }

	useEffect(() => {
		(async () => {
			const url = JSON.parse((await AsyncStorage.getItem("url")) || "null");
			// if (url) router.push(url);
		})();
	}, []);
	useEffect(() => {
		AsyncStorage.setItem("url", JSON.stringify({ pathname, params }));
	}, [pathname, params]);
	return (
		<>
			<StatusBar style="light" />
			<GestureHandlerRootView style={{ flex: 1 }}>
				<FadeoutSplash>
					<Stack
						screenOptions={{
							contentStyle: { backgroundColor: "#000015" },
							// headerShown: false,
							headerTransparent: true,

							headerTitleStyle: { color: "#F0F0F0" },
						}}
					>
						<Stack.Screen
							name="(tabs)"
							options={{
								title: "Top",
								// title: String(params.title || ""),
								// headerShown: false,
								headerTitle: () => (
									<Image
										source={require("assets/white_title.png")}
										style={{ height: 20, width: 191 }}
										resizeMode="contain"
									/>
								),
								headerRight: () => (
									<Pressable
										onPress={() => {
											router.push("/add");
										}}
									>
										<Ionicons name="add" size={30} color="#F0F0F0" />
									</Pressable>
								),
								headerBackground: () => (
									<BlurView
										tint="dark"
										intensity={50}
										style={StyleSheet.absoluteFill}
									/>
								),
							}}
						/>
						<Stack.Screen
							name="[novel_id]"
							options={{
								title: String(params.title || ""),
								headerBackground: () => (
									<BlurView
										tint="dark"
										intensity={50}
										style={StyleSheet.absoluteFill}
									/>
								),
								// headerShown: false,
							}}
						/>
						<Stack.Screen
							name="auth"
							options={{
								// Set the presentation mode to modal for our modal route.
								presentation: "modal",
							}}
						/>
						<Stack.Screen
							name="episode"
							options={{
								// Set the presentation mode to modal for our modal route.
								presentation: "fullScreenModal",
								headerTransparent: false,
								headerStyle: { backgroundColor: "#000030" },
								headerTitle: "aaaaaaa",
							}}
						/>
						<Stack.Screen
							name="add"
							options={{
								// Set the presentation mode to modal for our modal route.
								presentation: "modal",
								headerTitle: n({ default: "Add a Novel", jp: "作品を追加" }),
								// headerBackground: () => (
								// 	<View
								// 		style={[
								// 			StyleSheet.absoluteFill,
								// 			{ borderBottomWidth: 1, borderColor: "#000030" },
								// 		]}
								// 	/>
								// ),
								headerStyle: { backgroundColor: "#000030" },
								headerTitleStyle: { color: "#F0F0F0" },
								headerRight: () => (
									<Pressable
										onPress={() => {
											if (loading) return;
											if (title) {
												router.back();
												createNovel({
													title,
													description,
													onLoading: (bool) => {
														setEstate({ loading: bool });
													},
												}).then(() => {
													setEstate({ title: "", description: "" });
												});
											} else {
												Alert.alert(
													n({
														default: "Title is not entered",
														jp: "作品名を入力してください",
													})
												);
											}
										}}
									>
										<Text style={{ fontWeight: "bold", fontSize: 16 }}>
											{!loading && n({ default: "Add", jp: "追加" })}
										</Text>
									</Pressable>
								),
								headerLeft: () => (
									<Pressable
										onPress={() => {
											router.back();
										}}
									>
										<Text style={{ fontWeight: "bold", fontSize: 16 }}>
											{n({ default: "Cancel", jp: "キャンセル" })}
										</Text>
									</Pressable>
								),
							}}
						/>
					</Stack>
				</FadeoutSplash>
			</GestureHandlerRootView>
		</>
	);
}
const FadeoutSplash = ({ children }: { children: ReactNode }) => {
	const [isSplashReady, setSplashReady] = useState(false);
	const [assets, error] = useAssets([require("assets/splash.png")]);
	const [fontsLoaded, fontError] = useFonts({
		NotoSansJP_400Regular,
		NotoSerifJP_400Regular,
		GothicA1_400Regular,
		Roboto_400Regular,
		NotoSansJP_700Bold,
		NotoSansJP_500Medium,
	});
	useEffect(() => {
		async function prepare() {
			if (assets) await assets[0].downloadAsync();
			setSplashReady(true);
		}

		prepare();
	}, [assets]);

	if (!isSplashReady || !fontsLoaded) {
		return null;
	}

	return (
		<AnimatedSplashScreen image={assets?.[0]}>{children}</AnimatedSplashScreen>
	);
};

function AnimatedSplashScreen({
	children,
	image,
}: {
	children: ReactNode;
	image: Asset | undefined;
}) {
	const animation = useMemo(() => new Animated.Value(1), []);
	const [isAppReady, setAppReady] = useState(false);
	const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

	useEffect(() => {
		if (isAppReady) {
			Animated.timing(animation, {
				toValue: 0,
				duration: 500,
				useNativeDriver: true,
			}).start(() => setAnimationComplete(true));
		}
	}, [isAppReady]);

	const onImageLoaded = useCallback(async () => {
		try {
			await SplashScreen.hideAsync();
			// Load stuff
			const fontAssets = cacheFonts([Ionicons.font]);

			await Promise.all([...fontAssets]);
		} catch (e) {
			// handle errors
		} finally {
			setAppReady(true);
		}
	}, []);
	return (
		<View style={{ flex: 1 }}>
			{isAppReady && children}
			{!isSplashAnimationComplete && image && (
				<Animated.View
					pointerEvents="none"
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor:
								Constants.expoConfig?.splash?.backgroundColor || "#fff",
							opacity: animation,
						},
					]}
				>
					{image.localUri && (
						<Animated.Image
							style={{
								width: "100%",
								height: "100%",
								resizeMode:
									Constants.expoConfig?.splash?.resizeMode || "contain",
								opacity: animation,
							}}
							source={{ uri: image.localUri }}
							onLoadEnd={onImageLoaded}
							fadeDuration={0}
						/>
					)}
				</Animated.View>
			)}
		</View>
	);
}
