import { AnimatedIcon } from "@/components/AnimatedIcon";
import Text from "@/components/CustomText";
import { GroupeList } from "@/components/GroupeView";
import { createDoc } from "@/functions/createDoc";
import {
  setEstates,
  setGroupeRecord,
  useEstate,
  useSelectedGroupe,
} from "@/utils/estate";
import { isRemoteNovel } from "@/utils/isRemoteNovel";
import { n } from "@/utils/n";
import { supabase } from "@/utils/supabase";
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
  View,
} from "react-native";
import ContextMenu from "react-native-context-menu-view";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { DocItem } from "../../components/DocItem";
export default function Page() {
  const { session } = useEstate("main");
  const { docs, novels, setEstate, groupeRecord } = useEstate("persist");
  const [dndEnabled, setDndEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDocId, setActiveDocId] = useState<null | string>(null);
  const { novel_id } = useGlobalSearchParams();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const novel = novels[String(novel_id)];
  const isAuthor = isRemoteNovel(novel_id);
  const bottomTabHeight = useBottomTabBarHeight();
  const selected = useSelectedGroupe(novel_id, "doc_groups");

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        title: novel.title || "",
        headerRight: () => (
          <AnimatedIcon
            style={{
              paddingHorizontal: 15,
              marginRight: -15,
            }}
            onPress={() => {
              if (loading) return;

              createDoc({
                novel_id: String(novel_id),
                onLoading: setLoading,
              });
            }}
          >
            <Ionicons name="add" size={30} color="#F0F0F0" />
          </AnimatedIcon>
        ),
      });
    }, [])
  );

  useEffect(() => {
    if (isAuthor) {
      getDocs();
      getDocGroups();
    }
  }, [isAuthor]);

  async function getDocGroups() {
    try {
      // setLoading(true);
      if (isAuthor) {
        if (typeof novel_id !== "string") throw new Error("IDが文字列ではありません！");
        if (!session) throw new Error("sessionではありません！");
        const { data, error, status } = await supabase
          .from("doc_groups")
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
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      // setLoading(false);
    }
  }
  async function getDocs() {
    try {
      setLoading(true);
      if (isAuthor) {
        if (typeof novel_id !== "string") throw new Error("IDが文字列ではありません！");
        if (!session) throw new Error("sessionではありません！");
        const { data, error, status } = await supabase
          .from("docs")
          .select("*")
          .eq("novel_id", novel_id)
          .order("updated_at", { ascending: false });
        if (error && status !== 406) {
          throw error;
        }
        if (data) {
          setEstates.persist(
            {
              docs: (cv) => {
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
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }
  const onDeleteItem = (item: string, selected: string) => {
    const doc = docs[item];
    const doc_groups = novels[String(novel_id)].doc_groups.filter(
      (value) => value !== item
    );
    const groupeList = groupeRecord[selected].list.filter((value) => value !== item);
    if (doc) {
      setEstate(
        {
          docs: (cv) => {
            delete cv[item];
            return cv;
          },
          novels: (cv) => {
            cv[String(novel_id)].doc_groups = doc_groups;
            return cv;
          },
          groupeRecord: (cv) => {
            if (cv[selected]) {
              cv[selected].list = groupeList;
            }
            return cv;
          },
        },
        true
      );
    }
    if (isAuthor) {
      supabase
        .from("docs")
        .delete()
        .eq("id", item)
        .then(({ error }) => {
          if (error) {
          } else {
            supabase
              .from("novels")
              .update({ doc_groups: doc_groups })
              .eq("id", String(novel_id))
              .then((res) => {
                console.log("^_^ Log \n file: index.tsx:203 \n res:", res);
              });
            if (groupeRecord[selected]) {
              supabase
                .from("doc_groups")
                .update({ list: groupeList })
                .eq("id", selected)
                .then((res) => {
                  console.log("^_^ Log \n file: index.tsx:203 \n res:", res);
                });
            }
          }
        });
    }
  };
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
          data={novel.doc_groups}
          keyExtractor={(item) => item}
          novel_id={String(novel_id)}
          groupe_name={"doc_groups"}
        />
      </BlurView>
      {selected && (
        <DraggableFlatList
          style={{ paddingTop: headerHeight + 50 }}
          keyExtractor={(item) => item}
          data={groupeRecord[selected]?.list || []}
          onDragEnd={async ({ data }) => {
            setGroupeRecord(selected, "list", data);
            if (isAuthor) {
              await supabase
                .from("doc_groups")
                .update({
                  list: data,
                })
                .eq("id", selected);
            }
          }}
          renderItem={({ item, drag, isActive }) => (
            <ScaleDecorator key={item}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
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
                        default: "Sort",
                        jp: "並び替え",
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
                            ...novel.doc_groups.map((id) => groupeRecord[id].title),
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
                                  const currentGroupe = docs[item].doc_groupe_id;
                                  if (currentGroupe)
                                    cv[currentGroupe].list = cv[
                                      currentGroupe
                                    ].list.filter((id) => id !== item);
                                  const target = cv[novel.doc_groups[i]];
                                  try {
                                    target.list.push(item);
                                  } catch (error) {
                                    console.log(
                                      "^_^ Log \n file: docs.tsx:532 \n error:",
                                      error
                                    );
                                  }

                                  return cv;
                                },
                                docs: (cv) => {
                                  cv[item].doc_groupe_id = novel.doc_groups[i];
                                  return cv;
                                },
                              },
                              true
                            );
                          }
                        }
                      );
                    } else if (nativeEvent.index === 1) {
                      setDndEnabled(true);
                      setActiveDocId(null);
                    } else if (nativeEvent.index === 2) {
                      onDeleteItem(item, selected);
                    }
                  }}
                  disabled={dndEnabled}
                >
                  <DocItem
                    isActive={item === activeDocId}
                    doc_id={item}
                    onActive={(bool) => {
                      setActiveDocId(bool ? item : null);
                    }}
                    isDraggable={dndEnabled}
                    drag={drag}
                    onChangeDraggable={setDndEnabled}
                  />
                </ContextMenu>
              </View>
            </ScaleDecorator>
          )}
          ListFooterComponent={() => (
            <View style={{ height: bottomTabHeight + headerHeight + 50 }} />
          )}
          ListEmptyComponent={() => (
            <View style={{ padding: 25, paddingTop: 50 }}>
              <Text style={{ fontSize: 16, textAlign: "center" }}>
                {selected
                  ? n({
                      default: `There are no documents in ${groupeRecord[selected].title}\nLet's add a new document from the + icon on the right side of the header.`,
                      jp: `${groupeRecord[selected].title}に分類された資料はありません。右上の＋アイコンから新しい資料を追加しましょう。`,
                    })
                  : n({
                      default:
                        "There are no documents yet. First, let's add a new document group from the + icon above.",
                      jp: "まだ資料がありません。\nまずは上の＋アイコンから新しい分類グループを追加しましょう。",
                    })}
              </Text>
            </View>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
}
