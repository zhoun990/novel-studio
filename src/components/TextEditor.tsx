import Text from "@/components/CustomText";
import { useLocalSearchParams } from "expo-router";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Pressable, View } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { useEstate } from "@/utils/estate";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboard } from "@/hooks/useKeyboard";
import Animated, { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { BlurView } from "expo-blur";
const WindowHeight = Dimensions.get("window").height;

export const TextEditor = ({ toolbar = [] }: { toolbar?: ReactNode[] }) => {
  const ref = useRef<TextInput>(null);
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });
  const { episodes, setEstate } = useEstate("persist");
  const { novel_id, episode_id } = useLocalSearchParams();
  const episode = episodes[String(episode_id)];
  const [text, setText] = useState(episode?.text) || "";
  const [undo, setUndo] = useState<string[]>([]);
  const [redo, setRedo] = useState<string[]>([]);
  const headerHeight = useHeaderHeight();
  const { top, bottom } = useSafeAreaInsets();
  const { height: keyboardHeight } = useKeyboard();
  const textAreaHeight = useSharedValue(
    WindowHeight - keyboardHeight - (keyboardHeight ? 0 : bottom)
  );

  useEffect(() => {
    textAreaHeight.value = withTiming(
      WindowHeight - keyboardHeight - (keyboardHeight ? 0 : bottom) - headerHeight,
      { duration: 400, easing: Easing.inOut(Easing.exp) }
    );
  }, [keyboardHeight]);
  useEffect(() => {
    if (text) {
      setEstate(
        {
          episodes: (cv) => {
            cv[String(episode_id)].text = text;
            cv[String(episode_id)].character_count = text.replace(/\s/g, "").length;
            return cv;
          },
        },
        true
      );
    }
  }, [text]);
  const history = {
    undo: () => {
      // console.log("undo", undo);
      if (undo.length) {
        setRedo((cv) => cv.concat(text));
        setText(undo[undo.length - 1]);
        setUndo((cv) => {
          if (cv.length > 0) {
            return cv.slice(0, -1);
          }
          return cv;
        });
      }
    },
    redo: () => {
      if (redo.length) {
        setUndo((cv) => cv.concat(text));
        setText(redo[redo.length - 1]);
        setRedo((cv) => {
          if (cv.length > 0) {
            return cv.slice(0, -1);
          }
          return cv;
        });
      }
    },
  };
  return (
    <Animated.View
      style={[
        {
          height: textAreaHeight,
          position: "relative",
        },
      ]}
    >
      <TextInput
        ref={ref}
        onChangeText={(value) => {
          if (undo[undo.length - 1] !== text && text !== value) {
            setUndo((cv) => cv.concat(text));
            setRedo([]);
          }
          setText(value);
        }}
        value={text}
        style={{
          fontSize: 22,
          // backgroundColor: "green",
          // flexGrow: 1,
          color: "#F0F0F0",
          padding: 10,
          // paddingTop: headerHeight,
          // paddingBottom: 45,
          height:
            WindowHeight -
            keyboardHeight -
            (keyboardHeight ? 0 : bottom) -
            headerHeight -
            45,
          fontFamily: "NotoSansJP_500Medium",
          // lineHeight: 32,
          // height: WindowHeight - 60,
          // borderWidth: 1,
          // borderColor: "red",
        }}
        multiline
        keyboardAppearance="dark"
        onSelectionChange={(event) => {
          setCursorPosition({
            start: event.nativeEvent.selection.start,
            end: event.nativeEvent.selection.end,
          });
        }}
        selection={cursorPosition}
      />
      <ScrollView
        horizontal
        // intensity={keyboardHeight ? 50 : 0}
        style={{
          flexDirection: "row",
          flexShrink: 0,
          height: 45 + bottom,
          padding: 3,
          paddingBottom: bottom,
          position: "absolute",
          bottom: -bottom,
          width: "100%",
          backgroundColor: "#000030",
        }}
        keyboardShouldPersistTaps="always"
        // tint="dark"
      >
        <Pressable
          style={{
            padding: 5,
            paddingHorizontal: 10,
            borderRadius: 5,
            justifyContent: "center",
            alignItems: "center",
            margin: 2,
          }}
          onPress={history.undo}
        >
          <Ionicons
            name="arrow-undo-sharp"
            size={26}
            color={undo.length ? "#F0F0F0" : "gray"}
          />
        </Pressable>
        <Pressable
          style={{
            padding: 5,
            paddingHorizontal: 10,
            borderRadius: 5,
            justifyContent: "center",
            alignItems: "center",
            margin: 2,
          }}
          onPress={history.redo}
        >
          <Ionicons
            name="arrow-redo-sharp"
            size={26}
            color={redo.length ? "#F0F0F0" : "gray"}
          />
        </Pressable>
        {(
          [
            { value: "　", title: "__" },
            { value: "――", title: "――" },
            { value: "……", title: "……" },
            { value: "「", title: "「" },
            { value: "」", title: "」" },
            { value: "|漢字《かんじ》", title: "ルビ" },
          ] as {
            value: string;
            title?: string;
            icon?: string;
          }[]
        ).map((item, i) => (
          <Pressable
            key={i}
            style={{
              padding: 5,
              paddingHorizontal: 10,
              borderRadius: 5,
              justifyContent: "center",
              alignItems: "center",
              margin: 2,
            }}
            onPress={(e) => {
              e.preventDefault();
              const newText =
                text.slice(0, cursorPosition.start) +
                item.value +
                text.slice(cursorPosition.end);
              setUndo((cv) => cv.concat(text));
              setRedo([]);
              setText(newText);
            }}
          >
            {item.icon ? (
              <Ionicons name={item.icon as any} size={26} color="#F0F0F0" />
            ) : (
              <Text style={{ fontSize: 20 }}>{item.title}</Text>
            )}
          </Pressable>
        ))}
        {toolbar}
      </ScrollView>
    </Animated.View>
  );
};
