import { useEstate } from "@/utils/estate";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { Inputs } from "@/components/Inputs";

export const DocItem = ({
  isActive,
  doc_id,
  onActive,
  isDraggable,
  drag,
  onChangeDraggable,
}: {
  isActive: boolean;
  isDraggable: boolean;
  doc_id: string;
  onActive: (bool: boolean) => void;
  onChangeDraggable: (bool: boolean) => void;
  drag: () => void;
}) => {
  const { docs } = useEstate("persist");
  const [inited, init] = useState(true);

  const doc = docs[doc_id];
  const lastIndex = doc.title.length - 1;

  useEffect(() => {
    if (isDraggable) Keyboard.dismiss();
  }, [isDraggable]);

  const height = useSharedValue(98);
  const opacity = useSharedValue(0);
  const measure = () => {
    ref.current?.measure((x, y, w, h) => {
      console.log("^_^ Log \n file: docs.tsx:629 \n h:", h);
      if (h < 92) return;
      if (inited) height.value = withTiming(h);
      else height.value = h;
    });
  };
  const ref = useRef<View>(null);
  useEffect(() => {
    measure();
  }, [isActive, lastIndex, doc]);
  useEffect(() => {
    opacity.value = withTiming(isActive ? 1 : 0, { duration: 300 });
  }, [isActive]);

  return (
    <Animated.View
      style={{
        height,
        overflow: "hidden",
        borderBottomWidth: 1,
        borderColor: "gray",
      }}
    >
      <View ref={ref} style={{ padding: 10 }}>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
          }}
        >
          <Inputs
            i={0}
            styles={[
              {
                width: "85%",
                justifyContent: "center",
              },
              { fontSize: 26, paddingHorizontal: 10, flexShrink: 0 },
              { fontSize: 17, padding: 10 },
            ]}
            measure={measure}
            doc_id={doc_id}
            onChangeDraggable={onChangeDraggable}
            isActive={isActive}
          />

          <View>
            <Pressable
              onPressIn={() => {
                if (isDraggable) drag();
                else onActive(!isActive);
              }}
              style={{
                justifyContent: "center",
                flexGrow: isDraggable ? 1 : undefined,
                opacity: lastIndex ? 1 : 0,
              }}
            >
              <Ionicons
                name={
                  isDraggable
                    ? "reorder-three-outline"
                    : isActive
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={40}
                color="#F0F0F0"
              />
            </Pressable>
          </View>
        </View>
        {isActive &&
          doc.title
            .map((title, i) => ({ title, text: doc.text[i] }))
            .map(({ title, text }, i) =>
              i ? (
                <Inputs
                  i={i}
                  key={i}
                  styles={[
                    {
                      borderBottomWidth: 1,
                      borderColor: "gray",
                      marginTop: 30,
                      opacity,
                    },
                    { fontSize: 24, paddingHorizontal: 10, flexShrink: 0 },
                    { fontSize: 17, padding: 10 },
                  ]}
                  measure={measure}
                  doc_id={doc_id}
                  isActive={isActive}
                />
              ) : null
            )}
      </View>
    </Animated.View>
  );
};
