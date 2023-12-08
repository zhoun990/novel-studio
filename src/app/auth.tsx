import { Button } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "@/utils/supabase";
import { SafeAreaView } from "react-native";
import { Alert } from "react-native";
import { Provider } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useEstate } from "@/utils/estate";
import { Link, Stack, router } from "expo-router";

WebBrowser.maybeCompleteAuthSession(); // required for web only
const redirectTo = makeRedirectUri();

const createSessionFromUrl = async (url: string) => {
	const { params, errorCode } = QueryParams.getQueryParams(url);

	if (errorCode) throw new Error(errorCode);
	const { access_token, refresh_token } = params;

	if (!access_token) return;

	const { data, error } = await supabase.auth.setSession({
		access_token,
		refresh_token,
	});
	if (error) throw error;
	return data.session;
};

const performOAuth = async (provider: Provider) => {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo,
			skipBrowserRedirect: true,
		},
	});
	if (error) throw error;

	const res = await WebBrowser.openAuthSessionAsync(
		data?.url ?? "",
		redirectTo
	);

	if (res.type === "success") {
		const { url } = res;
		await createSessionFromUrl(url);
	}
};

const signInWithOtp = async () => {
	const { error } = await supabase.auth.signInWithOtp({
		// email: "zhoun990@gmail.com",
		// options: {
		// 	emailRedirectTo: redirectTo,
		// },
		phone: "+36706358475",
	});

	if (error) {
		Alert.alert(error.name, error.message);
	} else {
		// Email sent.
		Alert.alert("Sent");
	}
};
const sendMagicLink = async () => {
	const { error } = await supabase.auth.signInWithOtp({
		email: "zhoun990@gmail.com",
		options: {
			emailRedirectTo: redirectTo,
		},
	});

	if (error) {
		Alert.alert(error.name, error.message);
	} else {
		// Email sent.
		Alert.alert("Sent");
	}
};

export default function Auth() {
	const { session } = useEstate("main");
	const { setEstate } = useEstate("persist");

	// Handle linking into app from email app.
	const url = Linking.useURL();
	if (url) createSessionFromUrl(url);
	useEffect(() => {
		if (session?.user) {
			router.replace("/");
		}
	}, [session]);
	const signinRecommendation = () => {
		setEstate({
			signinRecommendation: true,
		});
	};
	return (
		<SafeAreaView>
			{/* <Button onPress={()=>performOAuth('apple')} title="Sign in with Apple" /> */}
			<Button
				onPress={() => {
					signinRecommendation();
					performOAuth("google");
				}}
				title="Sign in with Google"
			/>
			<Button
				onPress={() => {
					signinRecommendation();
					sendMagicLink();
				}}
				title="Send Magic Link"
			/>
			<Button
				onPress={() => {
					signinRecommendation();
					signInWithOtp;
				}}
				title="signInWithOtp"
			/>
			<Button
				onPress={() => {
					signinRecommendation();
					router.replace("/");
				}}
				title="サインインせずに続行"
			/>
		</SafeAreaView>
	);
}
