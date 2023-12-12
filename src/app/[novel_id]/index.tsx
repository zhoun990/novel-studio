import { AnimatedIcon } from "@/components/AnimatedIcon";
import Text from "@/components/CustomText";
import { HorizontalListItem } from "@/components/HorizontalListItem";
import { createEpisode } from "@/functions/createEpisode";
import { createEpisodeGroupe } from "@/functions/createEpisodeGroupe";
import { deleteEpisode } from "@/functions/deleteEpisode";
import { deleteEpisodeGroupe } from "@/functions/deleteEpisodeGroupe";
import { moveEpisodeGroupe } from "@/functions/moveEpisodeGroupe";
import {
  setEpisode,
  setEpisodeGroups,
  setNovel,
  setSelectedEpisodeGroups,
  useEstate,
} from "@/utils/estate";
import { isRemoteNovel } from "@/utils/isRemoteNovel";
import { n } from "@/utils/n";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { BlurView } from "expo-blur";
import {
  router,
  useFocusEffect,
  useGlobalSearchParams,
  useNavigation,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import ContextMenu from "react-native-context-menu-view";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { FadeInRight, FadeInUp, FadeOutUp } from "react-native-reanimated";
import { getEpisodeGroups } from "../../functions/getEpisodeGroups";
import { getEpisodes } from "../../functions/getEpisodes";
const WindowWidth = Dimensions.get("window").width;

export default function Page() {
  const {
    episodes,
    novels,
    setEstate,
    episodeGroups,
    selectedEpisodeGroupe: selectedGroupe,
  } = useEstate("persist");
  const [loading, setLoading] = useState(false);
  const { novel_id } = useGlobalSearchParams();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const novel = novels[String(novel_id)];
  const selected = selectedGroupe[String(novel_id)];
  const isAuthor = isRemoteNovel(novel_id);
  const bottomTabHeight = useBottomTabBarHeight();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        title: novels[String(novel_id)]?.title || "",
        headerRight: () => (
          <AnimatedIcon
            style={{
              paddingHorizontal: 15,
              marginRight: -15,
            }}
            onPress={() => {
              if (loading) return;
              if (Platform.OS === "web") {
                createEpisode({
                  novel_id: String(novel_id),
                  title: "this is title",
                  tags: ["type_episode"],
                  onLoading: setLoading,
                });
              } else
                Alert.prompt(
                  n({ default: "Add a new episode", jp: "エピソードの追加" }),
                  undefined,
                  async (title) => {
                    createEpisode({
                      novel_id: String(novel_id),
                      title,
                      tags: ["type_episode"],
                      onLoading: setLoading,
                    });
                  }
                );
            }}
          >
            <Ionicons name="add" size={30} color="#F0F0F0" />
          </AnimatedIcon>
        ),
      });
      // navigation.getParent()?.setOptions({ swipeEdgeWidth: 0 });
      return () => {
        navigation.getParent()?.setOptions({ swipeEdgeWidth: WindowWidth / 2 });
      };
    }, [])
  );

  useEffect(() => {
    if (isAuthor) {
      getEpisodes({ novel_id: String(novel_id), onLoading: setLoading });
      getEpisodeGroups({ novel_id: String(novel_id) });
    }
  }, [isAuthor]);

  if (!novel) return null;
  return (
    <View style={{ flex: 1 }}>
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
        <DraggableFlatList
          keyExtractor={(item) => item}
          data={novel.groups}
          style={{ height: "100%" }}
          onDragEnd={async ({ data }) => {
            setNovel(novel_id, (cv) => {
              cv.groups = data;
              return cv;
            });
            if (isAuthor) {
              await supabase
                .from("novels")
                .update({
                  groups: data,
                })
                .eq("id", String(novel_id));
            }
          }}
          initialScrollIndex={
            selected &&
            novel.groups.reduce((acc, v, i) => {
              acc += 40 + episodeGroups[novel.groups[i]].title.length * 20;

              return acc;
            }, 90) > WindowWidth
              ? novel.groups?.indexOf(selected)
              : 0
          }
          showsHorizontalScrollIndicator={false}
          getItemLayout={(data, index) => {
            return {
              length: 40 + episodeGroups[novel.groups[index]].title.length * 20,
              offset: novel.groups.reduce((acc, v, i) => {
                if (i < index) {
                  acc += 40 + episodeGroups[novel.groups[i]].title.length * 20;
                }
                return acc;
              }, 0), //90
              index,
            };
          }}
          renderItem={(props) => (
            <HorizontalListItem
              key={props.item}
              {...props}
              isSelected={selected === props.item}
              onPressSelected={() => {
                ActionSheetIOS.showActionSheetWithOptions(
                  {
                    options: [
                      "Cancel",
                      n({ default: "Rename", jp: "フォルダ名変更" }),
                      n({ default: "Delete", jp: "フォルダー削除" }),
                    ],
                    cancelButtonIndex: 0,
                    destructiveButtonIndex: 2,
                    userInterfaceStyle: "dark",
                  },
                  (buttonIndex) => {
                    try {
                      switch (buttonIndex) {
                        case 0: // cancel action
                          break;
                        case 1:
                          Alert.prompt(
                            n({
                              default: "Rename the folder",
                              jp: "フォルダ名を変更",
                            }),
                            "",
                            async (title) => {
                              if (isRemoteNovel(novel_id)) {
                                await supabase
                                  .from("episode_groups")
                                  .update({
                                    title,
                                  })
                                  .eq("id", props.item)
                                  .then(({ data, error }) => {
                                    if (error) throw error;
                                  });
                              }
                              setEpisodeGroups(props.item, (cv) => {
                                cv.title = title;
                                return cv;
                              });
                            },
                            undefined,
                            episodeGroups[props.item].title || ""
                          );
                          break;
                        case 2:
                          Alert.alert(
                            n({
                              default: "Delete the folder",
                              jp: "フォルダーを削除",
                            }),
                            n({
                              default:
                                "Are you sure you want to delete this folder?\nNote that the episodes contained in the folder will not be deleted. If you wish to delete episodes, please delete it individually.",
                              jp: "本当にこのフォルダーを削除してよろしいですか？\n※フォルダーに含まれるエピソードは削除されません。エピソードを削除したい場合は個別に削除して下さい。",
                            }),
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: async () =>
                                  deleteEpisodeGroupe({
                                    novel_id: String(novel_id),
                                    episode_groupe_id: props.item,
                                  }),
                              },
                            ]
                          );
                          break;
                        default:
                          break;
                      }
                    } catch (error) {
                      console.error("^_^ Log \n file: Account.tsx:69 \n error:", error);
                      if (error instanceof Error) {
                        Alert.alert(error.message);
                      }
                    }
                  }
                );
              }}
              onSelected={(item) => {
                setSelectedEpisodeGroups(novel_id, item);
              }}
              style={{
                marginLeft: 10,
                height: 40,
                width: 30 + episodeGroups[props.item]?.title.length * 20,
                borderRadius: 100,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20 }} ellipsizeMode="tail">
                {episodeGroups[props.item]?.title}
              </Text>
            </HorizontalListItem>
          )}
          horizontal
          ListHeaderComponent={() => (
            <HorizontalListItem
              item={null}
              isSelected={!selected}
              onPress={() => {
                setSelectedEpisodeGroups(novel_id, null);
              }}
              style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#000030",
                borderRadius: 100,
                marginLeft: 10,
                borderWidth: 2,
                height: 40,
                width: 80,
              }}
            >
              <Text style={{ fontSize: 20 }}>{n({ default: "All", jp: "全て" })}</Text>
            </HorizontalListItem>
          )}
          ListFooterComponent={() => (
            <HorizontalListItem
              item={null}
              onPress={() => {
                if (loading) return;
                Alert.prompt(
                  n({ default: "Create a new folder", jp: "フォルダを作成" }),
                  undefined,
                  async (title) => {
                    createEpisodeGroupe({
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
              {!novel.groups && (
                <Text>{n({ default: "New Folder", jp: "フォルダ" })}</Text>
              )}
            </HorizontalListItem>
          )}
          contentContainerStyle={{ alignItems: "center" }}
          // itemEnteringAnimation={FadeInRight}
          itemExitingAnimation={FadeInRight.duration(500)}
        />
      </BlurView>

      <DraggableFlatList
        itemEnteringAnimation={FadeInUp}
        itemExitingAnimation={FadeOutUp}
        style={{ paddingTop: headerHeight + 50 }}
        keyExtractor={(item) => item}
        data={
          (selected
            ? episodeGroups[selected]?.episodes_list
            : novels[String(novel_id)]?.episodes_list) || []
        }
        onDragEnd={async ({ data }) => {
          if (selected) {
            setEpisodeGroups(selected, (cv) => {
              cv.episodes_list = data;
              return cv;
            });
            if (isAuthor) {
              await supabase
                .from("episode_groups")
                .update({
                  episodes_list: data,
                })
                .eq("id", selected);
            }
          } else {
            setNovel(novel_id, (cv) => {
              cv.episodes_list = data;
              return cv;
            });
            if (isAuthor) {
              await supabase
                .from("novels")
                .update({
                  episodes_list: data,
                })
                .eq("id", String(novel_id));
            }
          }
        }}
        renderItem={({ item, drag }) => (
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
                style={{
                  flexGrow: 1,
                }}
                previewBackgroundColor="transparent"
                actions={[
                  {
                    title: n({
                      default: "Move Folder",
                      jp: "フォルダーを移動",
                    }),
                  },
                  {
                    title: n({
                      default: "Pull out of folder",
                      jp: "フォルダーから出す",
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
                  switch (nativeEvent.index) {
                    case 0:
                      moveEpisodeGroupe({ novel_id, item });
                      break;
                    case 1:
                      const currentGroupe = episodes[item].groupe;
                      if (currentGroupe)
                        setEpisodeGroups(currentGroupe, (cv) => {
                          cv.episodes_list = cv.episodes_list.filter((id) => id !== item);
                          return cv;
                        });

                      setEpisode(item, (cv) => {
                        cv.groupe = null;
                        return cv;
                      });

                      break;
                    case 2:
                      deleteEpisode({
                        novel_id: String(novel_id),
                        episode_id: item,
                      });
                      break;

                    default:
                      break;
                  }
                }}
              >
                <Pressable
                  onPress={() => {
                    router.push({
                      pathname: "/episode/[episode_id]",
                      params: {
                        novel_id,
                        episode_id: item,
                      },
                    });
                  }}
                  style={{
                    borderBottomWidth: 1,
                    borderColor: "gray",
                    flexGrow: 1,
                    padding: 15,
                  }}
                >
                  <Text
                    style={{ fontSize: 20, marginBottom: 3 }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {episodes[item] ? episodes[item].title : "Not Found"}
                  </Text>
                  <Text numberOfLines={1} ellipsizeMode="tail">
                    {episodes[item]?.text?.replace(/\n/g, "").substring(0, 50)}
                  </Text>
                </Pressable>
              </ContextMenu>
              <Pressable
                onPressIn={drag}
                style={{
                  paddingHorizontal: 20,
                }}
              >
                <Ionicons name="reorder-three-outline" size={40} color="#F0F0F0" />
              </Pressable>
            </View>
          </ScaleDecorator>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 25, paddingTop: 50 }}>
            <Text style={{ fontSize: 16, textAlign: "center" }}>
              {selected
                ? n({
                    default: `There are no episodes in ${episodeGroups[selected].title}\nLet's add a new episode from the + icon on the right side of the header.`,
                    jp: `${episodeGroups[selected].title}に分類された資料はありません。右上の＋アイコンから新しい資料を追加しましょう。`,
                  })
                : n({
                    default:
                      "There are no episodes yet.\nLet's add a new episode from the + icon on the right side of the header.",
                    jp: "まだエピソードがありません。\n右上の＋アイコンから新しいエピソードを追加しましょう。",
                  })}
            </Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={{ height: bottomTabHeight + headerHeight + 50 }} />
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
