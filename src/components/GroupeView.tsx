import Text from "@/components/CustomText";
import { HorizontalListItem } from "@/components/HorizontalListItem";
import { createGroupe } from "@/functions/createGroupe";
import { deleteGroupe } from "@/functions/deleteGroupe";
import {
  useSelectedGroupe,
  setNovel,
  setSelectedGroupe,
  useEstate,
  setGroupeRecord,
} from "@/utils/estate";
import { isRemoteNovel } from "@/utils/isRemoteNovel";
import { n } from "@/utils/n";
import { supabase } from "@/utils/supabase";
import { GroupeNames } from "@/utils/types";
import { Novel } from "@/utils/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ReactNode, useState } from "react";
import { ActionSheetIOS, Alert, Dimensions } from "react-native";
import DraggableFlatList, {
  DraggableFlatListProps,
} from "react-native-draggable-flatlist";
import { FadeInRight } from "react-native-reanimated";
export const WindowWidth = Dimensions.get("window").width;

export const GroupeList = <T extends GroupeNames, U extends Novel[T][number]>(
  props: {
    novel_id: string;
    groupe_name: T;
    renderItem?: DraggableFlatListProps<U>["renderItem"];
  } & Omit<DraggableFlatListProps<U>, "renderItem">
) => {
  const [loading, setLoading] = useState(false);
  const { novels, groupeRecord } = useEstate("persist");
  const {
    style,
    novel_id,
    groupe_name,
    ListFooterComponent,
    contentContainerStyle,
    renderItem,
    getItemLayout,
    showsHorizontalScrollIndicator,
    initialScrollIndex,
    onDragEnd,
    ...others
  } = props;
  const novel = novels[novel_id];
  const selected = useSelectedGroupe(novel_id, groupe_name);
  const groupeList = novel[groupe_name];
  return (
    <DraggableFlatList
      {...others}
      style={[{ height: "100%" }, style]}
      onDragEnd={
        onDragEnd ||
        (async ({ data }) => {
          setNovel(novel_id, (cv) => {
            cv[groupe_name] = data;
            return cv;
          });
          if (isRemoteNovel(novel_id)) {
            await supabase
              .from("novels")
              .update({
                [groupe_name]: data,
              })
              .eq("id", String(novel_id));
          }
        })
      }
      initialScrollIndex={
        initialScrollIndex ||
        Math.max(
          0,
          selected &&
            groupeList.reduce((acc, v, i) => {
              try {
                acc += 40 + groupeRecord[groupeList[i]].title.length * 20;
              } catch (error) {
                console.log("^_^ Log \n file: GroupeView.tsx:79 \n error:", error);
              }
              return acc;
            }, 0) > WindowWidth
            ? groupeList?.indexOf(selected)
            : 0
        )
      }
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator || false}
      getItemLayout={
        getItemLayout ||
        ((data, index) => {
          return {
            length: 40 + groupeRecord[groupeList[index]].title.length * 20,
            offset: groupeList.reduce((acc, v, i) => {
              if (i < index) {
                acc += 40 + groupeRecord[groupeList[i]].title.length * 20;
              }
              return acc;
            }, 0),
            index,
          };
        })
      }
      renderItem={
        renderItem ||
        ((props) => (
          <HorizontalListItem
            {...props}
            key={props.item}
            isSelected={selected === props.item}
            onSelected={(item) => {
              setSelectedGroupe(novel_id, groupe_name, item);
            }}
            onPressSelected={() => {
              ActionSheetIOS.showActionSheetWithOptions(
                {
                  options: [
                    "Cancel",
                    n({ default: "Rename", jp: "グループ名変更" }),
                    n({ default: "Delete", jp: "グループ削除" }),
                  ],
                  cancelButtonIndex: 0,
                  destructiveButtonIndex: 2,
                  userInterfaceStyle: "dark",
                },
                (buttonIndex) => {
                  try {
                    if (buttonIndex === 0) {
                      // cancel action
                    } else if (buttonIndex === 1) {
                      Alert.prompt(
                        n({
                          default: "Rename the groupe",
                          jp: "グループ名を変更",
                        }),
                        "",
                        async (title) => {
                          if (isRemoteNovel(novel_id)) {
                            await supabase
                              .from(groupe_name)
                              .update({
                                title,
                              })
                              .eq("id", props.item)
                              .then(({ error }) => {
                                if (error) throw error;
                              });
                          }
                          setGroupeRecord(props.item, "title", title);
                        },
                        undefined,
                        groupeRecord[props.item].title || ""
                      );
                    } else if (buttonIndex === 2) {
                      Alert.alert(
                        n({
                          default: "Delete the groupe",
                          jp: "グループを削除",
                        }),
                        n({
                          default: "Are you sure you want to delete this groupe?",
                          jp: "本当にこのグループを削除してよろしいですか？",
                        }),
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: () => {
                              deleteGroupe({
                                groupe_name,
                                groupe_id: props.item,
                                novel_id,
                              });
                            },
                          },
                        ]
                      );
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
            style={{
              marginLeft: 10,
              height: 40,
              // width: 30 + groupeRecord[props.item].title.length * 20,
              borderRadius: 100,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 20 }} ellipsizeMode="tail">
              {groupeRecord[props.item]?.title}
            </Text>
          </HorizontalListItem>
        ))
      }
      horizontal
      ListFooterComponent={
        ListFooterComponent ||
        (() => (
          <HorizontalListItem
            item={null}
            onPress={() => {
              if (loading) return;
              Alert.prompt(
                n({
                  default: "Create a new groupe",
                  jp: "グループを作成",
                }),
                undefined,
                async (title) => {
                  createGroupe({
                    groupe_name,
                    novel_id: novel_id,
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
            {!groupeList.length && (
              <Text>{n({ default: "New Groupe", jp: "新しいグループ" })}</Text>
            )}
          </HorizontalListItem>
        ))
      }
      contentContainerStyle={[{ alignItems: "center" }, contentContainerStyle]}
      itemExitingAnimation={FadeInRight.duration(500)}
    />
  );
};
