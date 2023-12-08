import { Button } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "@/utils/supabase";
import { SafeAreaView } from "react-native";
import { Alert } from "react-native";
import { Provider } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { setEstates, useEstate } from "@/utils/estate";
import { Link, Stack, router } from "expo-router";
import { TextInput } from "react-native-gesture-handler";
import { n } from "@/utils/n";

export default function Page() {
	const { title, description, setEstate } = useEstate("main");
	return (
		<SafeAreaView>
			<TextInput
				value={title}
				onChangeText={(value) => {
					setEstate({ title: value });
				}}
				style={{
					borderBottomWidth: 1,
					borderColor: "gray",
					paddingHorizontal: 10,
					marginHorizontal: 20,
					fontSize: 22,
					color: "#F0F0F0",
					paddingVertical: 5,
					marginTop: 20,
				}}
				placeholder={n({ default: "Title", jp: "作品名" })}
				placeholderTextColor={"gray"}
				maxLength={50}
				autoFocus
			/>
			<TextInput
				editable
				value={description}
				onChangeText={(value) => {
					setEstate({ description: value });
				}}
				style={{
					borderBottomWidth: 1,
					borderColor: "gray",
					paddingHorizontal: 10,
					marginHorizontal: 20,
					fontSize: 22,
					color: "#F0F0F0",
					paddingVertical: 5,
					marginTop: 20,
				}}
				placeholder={n({ default: "Description", jp: "作品の概要" })}
				placeholderTextColor={"gray"}
				maxLength={1000}
				multiline
				numberOfLines={4}
			/>
		</SafeAreaView>
	);
}
