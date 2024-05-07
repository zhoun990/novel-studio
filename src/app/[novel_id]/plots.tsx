import Text from "@/components/CustomText";
import TextInput from "@/components/CustomTextInput";
import { GroupeList } from "@/components/GroupeView";
import { HorizontalListItem } from "@/components/HorizontalListItem";
import { createGroupe } from "@/functions/createGroupe";
import { createPlot } from "@/functions/createPlot";
import { deletePlot } from "@/functions/deletePlot";
import {
  setEstates,
  setGroupeRecord,
  setNovel,
  setPlot,
  useEstate,
  useSelectedGroupe,
} from "@/utils/estate";
import { isRemoteNovel } from "@/utils/isRemoteNovel";
import { n } from "@/utils/n";
import { supabase } from "@/utils/supabase";
import { Plot } from "@/utils/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { BlurView } from "expo-blur";
import { useFocusEffect, useGlobalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Pressable,
  View,
} from "react-native";
import ContextMenu from "react-native-context-menu-view";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { FadeInRight } from "react-native-reanimated";
const WindowWidth = Dimensions.get("window").width;

export default function Page() {
  const { session } = useEstate("main");
  const { plots, novels, setEstate, groupeRecord } = useEstate("persist");
  const [loading, setLoading] = useState(false);
  const { novel_id } = useGlobalSearchParams();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const novel = novels[String(novel_id)];
  const selected = useSelectedGroupe(novel_id, "plot_groups");
  console.log("^_^ ::: file: plots.tsx:48 ::: selected:\n", selected);
  const isAuthor = isRemoteNovel(novel_id);
  const bottomTabHeight = useBottomTabBarHeight();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        title: novel.title || "",
        headerRight: null,
      });
    }, [])
  );

  useEffect(() => {
    if (isAuthor) {
      getPlots();
      getPlotGroups();
    }
  }, [isAuthor]);
  useEffect(() => {
    if (
      selected &&
      (!groupeRecord[selected]?.list.length ||
        plots[groupeRecord[selected]?.list?.concat()?.pop() || ""]?.text)
    ) {
      createPlot({ novel_id: String(novel_id) });
    }
  }, [
    groupeRecord[selected || ""]?.list,
    plots[groupeRecord[selected || ""]?.list?.concat()?.pop() || ""]?.text,
  ]);

  async function getPlotGroups() {
    try {
      // setLoading(true);
      if (isAuthor) {
        if (typeof novel_id !== "string") throw new Error("IDが文字列ではありません！");
        if (!session) throw new Error("sessionではありません！");
        const { data, error, status } = await supabase
          .from("plot_groups")
          .select("*")
          .eq("novel_id", novel_id)
          .order("updated_at", { ascending: false });
        if (error && status !== 406) {
          throw error;
        }
        if (data) {
          setEstates.persist(
            {
              groupeRecord: (cv) => {
                data.forEach((groupe) => {
                  cv[groupe.id] = groupe;
                });
                return cv;
              },
            },
            true
          );
        }
      }
    } catch (error) {
      console.error("^_^ ::: file: plots.tsx:108 ::: error:\n", error);
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      // setLoading(false);
    }
  }
  async function getPlots() {
    try {
      setLoading(true);
      if (isAuthor) {
        if (typeof novel_id !== "string") throw new Error("IDが文字列ではありません！");
        if (!session) throw new Error("sessionではありません！");
        const { data, error, status } = await supabase
          .from("plots")
          .select("*")
          .eq("novel_id", novel_id)
          .order("updated_at", { ascending: false });
        if (error && status !== 406) {
          throw error;
        }
        if (data) {
          setEstates.persist(
            {
              plots: (cv) => {
                data.forEach((novel) => {
                  cv[novel.id] = novel;
                });
                return cv;
              },
            },
            true
          );
        }
      }
    } catch (error) {
      console.error("^_^ ::: file: plots.tsx:145 ::: error:\n", error);
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!novel) return null;
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <BlurView
        tint="dark"
        style={{
          position: "absolute",
          top: headerHeight,
          width: "100%",
          height: 50,
          zIndex: 1,
        }}
      >
        <GroupeList
          data={novel.plot_groups}
          keyExtractor={(item) => item}
          novel_id={String(novel_id)}
          groupe_name={"plot_groups"}
          ListFooterComponent={() => (
            <HorizontalListItem
              item={null}
              onPress={() => {
                if (loading) return;
                Alert.prompt(
                  n({
                    default: "Create a new plot groupe",
                    jp: "プロットグループを作成",
                  }),
                  undefined,
                  async (title) => {
                    createGroupe({
                      groupe_name: "plot_groups",
                      novel_id: String(novel_id),
                      title,
                      onLoading: setLoading,
                    });
                  }
                );
              }}
              style={{
                // height: "100%",
                paddingHorizontal: 10,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#000030",
                borderRadius: 100,
                marginHorizontal: 10,
                flexDirection: "row",
                height: 40,
              }}
            >
              <Ionicons name="add" size={30} color="#F0F0F0" />
              {!novel.plot_groups.length && (
                <Text>{n({ default: "New Plot Groupe", jp: "プロットグループ" })}</Text>
              )}
            </HorizontalListItem>
          )}
        />
      </BlurView>
      <DraggableFlatList
        style={{ paddingTop: headerHeight + 50 }}
        keyExtractor={(item) => item}
        data={groupeRecord[selected || ""]?.list || []}
        onDragEnd={async ({ data }) => {
          if (selected) {
            setGroupeRecord(selected, "list", data);
            if (isAuthor) {
              await supabase
                .from("plot_groups")
                .update({
                  list: data,
                })
                .eq("id", selected);
            }
          }
        }}
        renderItem={({ item, drag, isActive }) => (
          <ScaleDecorator>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderColor: "gray",
                backgroundColor: "#000015",
              }}
            >
              <ContextMenu
                // style={{ padding: 10, height: "100%", backgroundColor: "blue" }}
                style={{
                  flexGrow: 1,
                }}
                previewBackgroundColor="transparent"
                actions={[
                  {
                    title: n({
                      default: "Move to",
                      jp: "グループを移動",
                    }),
                  },
                  {
                    title: n({
                      default: "Delete",
                      jp: "削除",
                    }),
                    destructive: true,
                  },
                ]}
                onPress={({ nativeEvent }) => {
                  if (nativeEvent.index === 0) {
                    ActionSheetIOS.showActionSheetWithOptions(
                      {
                        options: [
                          "Cancel",

                          ...novel.plot_groups.map((id) => groupeRecord[id].title),
                        ],
                        cancelButtonIndex: 0,
                        userInterfaceStyle: "dark",
                      },
                      (buttonIndex) => {
                        if (buttonIndex === 0) {
                          // cancel action
                        } else {
                          const i = buttonIndex - 1;
                          setEstate(
                            {
                              groupeRecord: (cv) => {
                                const currentGroupe = plots[item].plot_groupe_id;
                                if (currentGroupe)
                                  cv[currentGroupe].list = cv[currentGroupe].list.filter(
                                    (id) => id !== item
                                  );
                                const target = cv[novel.plot_groups[i]];
                                if (!plots[target?.list?.concat()?.pop() || ""].text)
                                  target.list.pop();
                                target.list.push(item);
                                return cv;
                              },
                              plots: (cv) => {
                                cv[item].plot_groupe_id = novel.plot_groups[i];
                                return cv;
                              },
                            },
                            true
                          );
                        }
                      }
                    );
                  } else if (nativeEvent.index === 1) {
                    deletePlot({ novel_id: String(novel_id), plot_id: item });
                  }
                }}
              >
                <View
                  style={{
                    padding: 10,
                    paddingVertical: 20,
                  }}
                >
                  <ProtEditor plots={plots} item={item} />
                </View>
              </ContextMenu>
              <Pressable onPressIn={drag} style={{ paddingHorizontal: 20 }}>
                <Ionicons name="reorder-three-outline" size={40} color="#F0F0F0" />
              </Pressable>
            </View>
          </ScaleDecorator>
        )}
        ListFooterComponent={() => (
          <View style={{ height: bottomTabHeight + headerHeight + 50 }} />
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 25 }}>
            <Text style={{ fontSize: 16, textAlign: "center" }}>
              {n({
                default:
                  "There are no plots yet.\nTry creating a plot group from the + icon above.",
                jp: "まだプロットがありません。\n上の＋アイコンからプロットグループを作成してみてください。",
              })}
            </Text>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}
let t = 0;
const ProtEditor = ({ plots, item }: { plots: Record<string, Plot>; item: string }) => {
  const [text, setText] = useState(plots[item]?.text);
  console.log("u", Date.now() - t);
  t = Date.now();
  useEffect(() => {}, [plots[item]?.text]);
  // useEffect(() => {
  // 	console.log(Date.now() - t);

  // 	t = Date.now();
  // 	if (plots[item]?.text !== text)
  // 		setPlot(item, (cv) => {
  // 			cv.text = text;
  // 			return cv;
  // 		});
  // }, [text]);
  return (
    <TextInput
      value={plots[item]?.text}
      onChangeText={(text) => setPlot(item, (cv) => ({ ...cv, text }))}
      style={{ fontSize: 18 }}
      placeholder={n({ default: "Plot text", jp: "プロット" })}
      placeholderTextColor={"gray"}
    />
  );
};
