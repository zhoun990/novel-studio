import Text from "@/components/CustomText";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Pressable,
  SafeAreaView,
  View,
  StyleSheet,
} from "react-native";
import { Button } from "react-native-elements";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { Unfocused } from "@/components/Unfocused";
import { usePgh } from "@/hooks/usePgh";
import { useEstate } from "@/utils/estate";
import { supabase } from "@/utils/supabase";
import { TextEditor } from "@/components/TextEditor";
import { BlurHeader } from "@/components/BlurHeader";
import Ionicons from "@expo/vector-icons/Ionicons";
import { n } from "@/utils/n";
import { BlurView } from "expo-blur";

const iPhoneWidth = Dimensions.get("window").width;
const iPhoneHeight = Dimensions.get("window").height;

export default function Page() {
  // return <View />;
  const nv = useNavigation("/episode");

  const { session, paragraphs, cursorPosition, focusedLine } = useEstate("main");
  const { novels, episodes, setEstate } = useEstate("persist");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(0);
  const { novel_id, episode_id } = useLocalSearchParams();
  const episode = episodes[String(episode_id)];
  const savedText = useRef(episode?.text);
  const notSavedText = useRef(episode?.text);

  // const pgh = usePgh();
  useEffect(() => {
    nv.getParent()?.setOptions({
      headerLeft: () => (
        <Pressable
          style={{
            // padding: 5,
            paddingRight: 20,
            borderRadius: 5,
            // backgroundColor: "#000030",
            justifyContent: "center",
            alignItems: "center",
            // marginLeft: 10,
          }}
          onPress={() => {
            save().then(() => router.back());
          }}
        >
          <Ionicons name="chevron-down-outline" size={30} color="#F0F0F0" />
        </Pressable>
      ),
      headerTitle: () => (
        <Text style={{ fontSize: 20 }}>
          {episode.title}
          {/* {episode?.text !== savedText.current && "*"}
				{loading && <ActivityIndicator  color="#F0F0F0" />} */}
        </Text>
      ),
      headerRight: () => (
        <Pressable
          style={{
            // padding: 5,
            paddingLeft: 20,
            borderRadius: 5,
            // backgroundColor: "#000030",
            justifyContent: "center",
            alignItems: "center",
            // marginRight: 10,
          }}
          onPress={() => {
            Alert.prompt(
              n({ default: "Edit Title", jp: "タイトルを編集" }),
              "",
              async (title) => {
                try {
                  if (session?.user?.id === novels[String(novel_id)].user_id) {
                    const { error } = await supabase
                      .from("episodes")
                      .update({
                        title,
                      })
                      .eq("id", episode.id);
                    if (error) {
                      throw error;
                    }
                  }
                  setEstate({
                    episodes: (cv) => {
                      cv[String(episode_id)].title = title;
                      return cv;
                    },
                  });
                  nv.getParent()?.setOptions({
                    headerTitle: () => (
                      <Text style={{ fontSize: 20 }}>
                        {episode.title}
                      </Text>
                    ),
                  });
                } catch (error) {
                  console.error("^_^ Log \n file: Account.tsx:69 \n error:", error);
                  if (error instanceof Error) {
                    Alert.alert(error.message);
                  }
                }
              },
              undefined,
              episode.title || ""
            );
          }}
        >
          <Ionicons name="create-outline" size={24} color="#F0F0F0" />
        </Pressable>
      ),
    });
    // nv.setOptions({ gestureEnabled: false, headerShown: false ,});
    // return () => {
    // 	nv.setOptions({ gestureEnabled: true, headerShown: true });
    // };
  }, []);
  useEffect(() => {
    if (typeof episode?.text === "string") {
      notSavedText.current = episode?.text || "";
    }
  }, [episode?.text]);
  const save = async () => {
    if (!episode || savedText.current === notSavedText.current) {
      return;
    }
    try {
      setLoading(true);

      if (session?.user?.id === novels[String(novel_id)].user_id) {
        const { error } = await supabase
          .from("episodes")
          .update({
            text: notSavedText.current,
            character_count: notSavedText.current.replace(/\s/g, "").length,
          })
          .eq("id", episode.id);
        if (error) {
          throw error;
        }
      }
      savedText.current = notSavedText.current;
    } catch (error) {
      console.error("^_^ Log \n file: Account.tsx:69 \n error:", error);
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (typeof episode?.text === "string") {
      let timeoutId: NodeJS.Timeout = setTimeout(save, 10000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [episode?.text]);
  // useEffect(() => {
  // 	// console.log("^_^ Log \n file: index.tsx:77 \n paragraphs:", paragraphs);
  // 	if (paragraphs?.length === 0) {
  // 		pgh.insert();
  // 	}
  // }, [paragraphs]);
  if (!episode)
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: "row" }}>
          <Button
            title="閉じる"
            onPress={() => {
              save().then(() => router.back());
            }}
          />
        </View>
        <Text>読み込み中</Text>
      </SafeAreaView>
    );
  return (
    <View style={{ flex: 1 }}>
      {mode === 0 && (
        <TextEditor
        // toolbar={[
        // 	<Button
        // 		key="ChangeMode"
        // 		title="ChangeMode"
        // 		onPress={() => {
        // 			setMode(mode === 0 ? 1 : 0);
        // 		}}
        // 	/>,
        // ]}
        />
      )}
      {mode === 1 && (
        <ScrollView
          style={{
            backgroundColor: "blue",
            minHeight: "100%",
          }}
        >
          {paragraphs?.map(
            (paragraph, i) => {
              const isFocused = i === focusedLine;
              const apExists = i > 0;
              const bpExists = paragraphs.length - 1 >= i + 1;
              // if (!isFocused && Math.abs(i - focusedLine) <= 1)
              // 	return <View key={paragraph.key} />;
              return (
                <Unfocused
                  i={i}
                  key={paragraph.key}
                  apExists={apExists}
                  bpExists={bpExists}
                  text={
                    i === focusedLine
                      ? (apExists ? paragraphs[i - 1].text + "\n" : "") +
                        paragraph.text +
                        (bpExists ? "\n" + paragraphs[i + 1]?.text : "")
                      : paragraph.text
                  }
                  isFocused={isFocused}
                  height={paragraph.height}
                  hidden={!isFocused && Math.abs(i - focusedLine) <= 1}
                />
              );
            }
            // )
          )}
          <View
            style={{
              // marginTop: h,
              backgroundColor: "#000015",
              height: iPhoneHeight * 0.9,
              borderWidth: 1,
            }}
          />
        </ScrollView>
      )}
    </View>
  );
}
