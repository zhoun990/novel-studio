import Text from "@/components/CustomText";
import { clearEstate, useEstate } from "@/utils/estate";
import { n } from "@/utils/n";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import "react-native-url-polyfill/auto";
import Auth from "../auth";
//[ToDo]リモートとローカルのコンフリクトの解決手段
export default function App() {
  const { session } = useEstate("main");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { novels, setEstate, signinRecommendation, forceRenderer, timestamp } =
    useEstate("persist");
  const headerHeight = useHeaderHeight();
  const bottomTabHeight = useBottomTabBarHeight();
  useEffect(() => {
    // clearEstate();
    if (session?.user) getNovels();
  }, [session]);

  async function getNovels() {
    if (session?.user) {
      try {
        setLoading(true);
        const { data, error, status } = await supabase
          .from("novels")
          .select("*")
          .eq("user_id", session.user.id)
          .order("updated_at", { ascending: false });
        if (error && status !== 406) {
          throw error;
        }

        if (data && data.length) {
          const newNovels = {} as typeof novels;
          data.forEach((novel) => {
            newNovels[novel.id] = {
              ...novel,
              synced_at: new Date().toISOString(),
            };
          });
          setEstate({ novels: (cv) => ({ ...cv, ...newNovels }) });
        }
      } catch (error) {
        console.error("^_^ Log \n file: Account.tsx:38 \n error:", error);
        if (error instanceof Error) {
          Alert.alert(error.message);
        }
      } finally {
        setLoading(false);
      }
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }

  if (!signinRecommendation && !session?.user) {
    return <Auth />;
  }
  return (
    <View
      style={{
        flex: 1,
        position: "relative",
        backgroundColor: "#000015",
      }}
    >
      <DraggableFlatList
        data={Object.keys(novels)
          .filter((b) => novels[b].updated_at)
          .sort(
            (a, b) =>
              new Date(novels[b].updated_at).getTime() -
              new Date(novels[a].updated_at).getTime()
          )}
        keyExtractor={(item) => item}
        style={{ paddingTop: headerHeight }}
        ListFooterComponent={() => (
          <View style={{ height: bottomTabHeight + headerHeight }} />
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              router.push({
                pathname: "/[novel_id]",
                params: { novel_id: novels[item].id },
              });
            }}
            style={{
              flex: 1,
              overflow: "hidden",
              backgroundColor: "#000015",
              padding: 10,
              paddingVertical: 5,
              height: 100,
            }}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontSize: 22, marginVertical: 4, fontWeight: "bold" }}
            >
              {novels[item].title}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontSize: 18, marginHorizontal: 4, color: "gray" }}
            >
              {(novels[item]?.description || "no text")
                .replace(/\n/g, "")
                .substring(0, 50)}
            </Text>
            <View
              style={{
                flexGrow: 1,
                flexDirection: "row",
                alignItems: "flex-end",
              }}
            >
              <View style={{ flexGrow: 1 }}>
                <Text style={{ marginLeft: 4, color: "gray" }}>
                  {novels[item]?.episodes_list?.length}エピソード
                </Text>
              </View>

              <Text style={{ marginRight: 5, color: "gray" }}>
                {novels[item]?.updated_at &&
                  (() => {
                    const diff =
                      new Date().getTime() - new Date(novels[item].updated_at).getTime();
                    const seconds = Math.floor(diff / 1000);

                    const minutes = Math.floor(seconds / 60);
                    const hours = Math.floor(minutes / 60);
                    const days = Math.floor(hours / 24);
                    if (days > 0) return `${days}日前`;
                    if (hours > 0) return `${hours}時間前`;
                    if (minutes > 0) return `${minutes}分前`;
                    return "たった今";
                  })()}
              </Text>
              {novels[item]?.user_id ? (
                <Ionicons name="cloud-done" size={17} color="green" />
              ) : (
                <Ionicons name="save" size={15} color="gray" />
              )}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={{ marginTop: headerHeight, padding: 25 }}>
            <Text style={{ fontSize: 16, textAlign: "center" }}>
              {n({
                default:
                  "There are no novels yet.\nLet's start to write a new novel from the + icon on the right side of the header.",
                jp: "まだ作品がありません。\n右上の＋アイコンから新しい作品を書き始めましょう。",
              })}
            </Text>
          </View>
        )}
      />

      {/* <SafeAreaView>
				{session?.user && (
					<View
						style={[
							{ paddingTop: 4, paddingBottom: 4, alignSelf: "stretch" },
							{ marginTop: 20 },
						]}
					>
						<Input label="Email" value={session?.user?.email} disabled />
					</View>
				)}
				<View
					style={[
						{
							paddingTop: 4,
							paddingBottom: 4,
							alignSelf: "stretch",
							flexDirection: "row",
							justifyContent: "center",
						},
						{ marginTop: 20 },
					]}
				>
					{session && (
						<Button
							title={loading ? "Loading ..." : "書き始める"}
							onPress={() => createNovel(setLoading)}
							disabled={loading}
						/>
					)}
					<Button
						title={"ローカルで書き始める"}
						onPress={() => createNovel(setLoading, true)}
						disabled={loading}
					/>
				</View>
			</SafeAreaView> */}
      {/* <FlatList
				style={{
					// flexGrow: 1,
					width: "100%",
					// paddingBottom: 200,
					paddingTop: headerHeight,
				}}
				progressViewOffset={headerHeight}
				data={Object.values(novels)
					.filter((b) => new Date(b.updated_at).getTime())
					.sort(
						(a, b) =>
							new Date(b.updated_at).getTime() -
							new Date(a.updated_at).getTime()
					)}
				ItemSeparatorComponent={({ highlighted }) => (
					<View
						style={[
							{ borderTopWidth: 1, borderColor: "gray" },
							highlighted && { marginLeft: 0 },
						]}
					/>
				)}
				renderItem={({ item }) => (
					<Pressable
						onPress={() => {
							router.push({
								pathname: "/[novel_id]",
								params: { novel_id: item.id },
							});
						}}
						style={{
							padding: 10,
							paddingVertical: 5,
							backgroundColor: "#000015",
						}}
					>
						<Text
							style={{ fontSize: 22, marginVertical: 4, fontWeight: "bold" }}
						>
							{item.title}
						</Text>
						<Text style={{ fontSize: 18, marginHorizontal: 4, color: "gray" }}>
							{item.description || "no text"}
						</Text>

						<View
							style={{
								flexDirection: "row",
							}}
						>
							<View style={{ flexGrow: 1 }}>
								<Text style={{ marginLeft: 4, color: "gray" }}>
									{item.episodes_list?.length}エピソード
								</Text>
							</View>

							<Text style={{ marginRight: 5, color: "gray" }}>
								{item.updated_at &&
									(() => {
										const diff =
											new Date().getTime() -
											new Date(item.updated_at).getTime();
										const seconds = Math.floor(diff / 1000);

										const minutes = Math.floor(seconds / 60);
										const hours = Math.floor(minutes / 60);
										const days = Math.floor(hours / 24);
										if (days > 0) return `${days}日前`;
										if (hours > 0) return `${hours}時間前`;
										if (minutes > 0) return `${minutes}分前`;
										return "たった今";
									})()}
							</Text>
							{item.user_id ? (
								<Ionicons name="cloud-done" size={17} color="green" />
							) : (
								<Ionicons name="save" size={15} color="gray" />
							)}
						</View>
					</Pressable>
				)}
				// onRefresh={() => {
				// 	console.log("reflesh");
				// 	setRefreshing(true);
				// 	getNovels();
				// }}
				refreshing={refreshing}
				indicatorStyle="white"
			/> */}
    </View>
  );
}
