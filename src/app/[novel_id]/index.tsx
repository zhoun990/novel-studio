import { AnimatedIcon } from "@/components/AnimatedIcon";
import Text from "@/components/CustomText";
import { HorizontalListItem } from "@/components/HorizontalListItem";
import { createEpisode } from "@/functions/createEpisode";
import { createEpisodeGroupe } from "@/functions/createEpisodeGroupe";
import { deleteEpisode } from "@/functions/deleteEpisode";
// import { deleteEpisodeGroupe } from "@/functions/deleteEpisodeGroupe";
import { moveEpisodeGroupe } from "@/functions/moveEpisodeGroupe";
import {
  clearEstate,
  setEpisode,
  // setEpisodeGroups,
  setGroupeRecord,
  setNovel,
  // setSelectedEpisodeGroups,
  setSelectedGroupe,
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
import { router, useFocusEffect, useNavigation } from "expo-router";
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
import { useGlobalSearchParamsString } from "../../hooks/useGlobalSearchParamsString";
import { GroupeList } from "@/components/GroupeView";
import { createGroupe } from "@/functions/createGroupe";
const WindowWidth = Dimensions.get("window").width;

export default function Page() {
  const { episodes, novels, setEstate, groupeRecord } = useEstate("persist");
  const [loading, setLoading] = useState(false);
  const { novel_id } = useGlobalSearchParamsString();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const novel = novels[novel_id];
  const selected = useSelectedGroupe(novel_id, "groups");
  const isAuthor = isRemoteNovel(novel_id);
  const bottomTabHeight = useBottomTabBarHeight();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        title: novels[novel_id]?.title || "",
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
        <GroupeList
          data={novel.groups}
          keyExtractor={(item) => item}
          novel_id={novel_id}
          groupe_name={"groups"}
          ListHeaderComponent={() => (
            <HorizontalListItem
              item={null}
              isSelected={!selected}
              onPress={() => {
                setSelectedGroupe(novel_id, "groups", null);
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
                    createGroupe({
                      groupe_name: "groups",
                      novel_id,
                      title,
                      onLoading: setLoading,
                    });
                  }
                );
              }}
              style={{
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
        />
      </BlurView>

      <DraggableFlatList
        itemEnteringAnimation={FadeInUp}
        itemExitingAnimation={FadeOutUp}
        style={{ paddingTop: headerHeight + 50 }}
        keyExtractor={(item) => item}
        data={
          (selected ? groupeRecord[selected]?.list : novels[novel_id]?.episodes_list) ||
          []
        }
        onDragEnd={async ({ data }) => {
          if (selected) {
            setGroupeRecord(selected, "list", data);
            if (isAuthor) {
              await supabase
                .from("episode_groups")
                .update({
                  list: data,
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
                .eq("id", novel_id);
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
                  if (nativeEvent.index === 0) moveEpisodeGroupe({ novel_id, item });
                  else if (nativeEvent.index === 1) {
                    const currentGroupe = episodes[item].groupe;
                    if (currentGroupe)
                      setGroupeRecord(currentGroupe, "list", (cv) =>
                        cv.filter((id) => id !== item)
                      );

                    setEpisode(item, (cv) => {
                      cv.groupe = null;
                      return cv;
                    });
                  } else if (nativeEvent.index === 2)
                    deleteEpisode({
                      novel_id: String(novel_id),
                      episode_id: item,
                    });
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
                    default: `There are no episodes in ${groupeRecord[selected].title}\nLet's add a new episode from the + icon on the right side of the header.`,
                    jp: `${groupeRecord[selected].title}に分類された資料はありません。右上の＋アイコンから新しい資料を追加しましょう。`,
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
