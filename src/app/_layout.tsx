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
import { Animated, View, StyleSheet, Image } from "react-native";
import { StatusBar, setStatusBarStyle } from "expo-status-bar";
import { BlurView } from "expo-blur";
SplashScreen.preventAutoHideAsync();

function cacheFonts(fonts: any[]) {
	return fonts.map((font) => Font.loadAsync(font));
}
export default function Layout() {
	const { session, setEstate } = useEstate("main");
	const pathname = usePathname();
	const params = useGlobalSearchParams();
	// const { title } = useLocalSearchParams();

	useEffect(() => {
		// setStatusBarStyle("light");
		supabase.auth.getSession().then(({ data: { session } }) => {
			setEstate({ session });
		});

		const { data } = supabase.auth.onAuthStateChange((_event, session) => {
			console.log("^_^ Log \n file: _layout.tsx:15 \n session:", !!session);
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
							headerBackground: () => (
								<BlurView
									tint="dark"
									intensity={50}
									style={StyleSheet.absoluteFill}
								/>
							),
							headerTitleStyle: { color: "white" },
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
							}}
						/>
						<Stack.Screen
							name="(drawer)"
							options={
								{
									// title: String(params.title || ""),
									// headerShown: false,
								}
							}
						/>
						<Stack.Screen
							name="auth"
							options={{
								// Set the presentation mode to modal for our modal route.
								presentation: "modal",
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

	useEffect(() => {
		async function prepare() {
			if (assets) await assets[0].downloadAsync();
			setSplashReady(true);
		}

		prepare();
	}, [assets]);

	if (!isSplashReady) {
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
