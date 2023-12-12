import TextInput from "@/components/CustomTextInput";
import { setDocs, useEstate } from "@/utils/estate";
import { n } from "@/utils/n";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";

export const Inputs = ({
  i,
  doc_id,
  styles,
  measure,
  onChangeDraggable,
  isActive,
}: {
  i: number;
  isActive: boolean;
  doc_id: string;
  measure: () => void;
  onChangeDraggable?: (bool: boolean) => void;
  styles?: [
    StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>?,
    StyleProp<TextStyle>?,
    StyleProp<TextStyle>?
  ];
}) => {
  const { docs } = useEstate("persist");
  const doc = docs[doc_id];
  const lastIndex = doc.title.length - 1;
  const handleDoc = (i: number) => {
    setDocs(doc_id, (cv) => {
      if (lastIndex !== i && !cv.title[i] && !cv.text[i]) {
        cv.title.splice(i, 1);
        cv.text.splice(i, 1);
      } else if (lastIndex === i && (cv.title[i] || cv.text[i])) {
        cv.title.push("");
        cv.text.push("");
      }
      return cv;
    });
    measure();
  };
  return (
    <Animated.View
      style={styles?.[0]}
      // entering={FadeIn.duration(500)}
      exiting={FadeOut}
    >
      <TextInput
        defaultValue={doc.title[i]}
        onChangeText={(value) => {
          if (value !== doc.title[i])
            setDocs(doc_id, (cv) => {
              cv.title[i] = value;
              return cv;
            });
        }}
        placeholder={n({ default: "Title", jp: "タイトル" })}
        placeholderTextColor={"gray"}
        style={styles?.[1]}
        maxLength={50}
        onContentSizeChange={measure}
        onEndEditing={() => handleDoc(i)}
        onFocus={() => onChangeDraggable?.(false)}
      />
      <TextInput
        defaultValue={doc.text[i]}
        onChangeText={(value) => {
          if (value !== doc.text[i])
            setDocs(doc_id, (cv) => {
              cv.text[i] = value;
              return cv;
            });
        }}
        placeholder={n({ default: "Text", jp: "本文" })}
        placeholderTextColor={"gray"}
        style={styles?.[2]}
        multiline={isActive}
        maxLength={5000}
        scrollEnabled={false}
        onEndEditing={() => handleDoc(i)}
        onFocus={() => onChangeDraggable?.(false)}
      />
    </Animated.View>
  );
};
