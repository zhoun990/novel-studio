import Text from "@/components/CustomText";
import { setEstates, useEstate } from "@/utils/estate";
import { n } from "@/utils/n";
import { SafeAreaView, View } from "react-native";
import { Switch, TextInput } from "react-native-gesture-handler";

export default function Page() {
  const { title, description, setEstate } = useEstate("main");
  const { template } = useEstate("persist");
  return (
    <SafeAreaView>
      <TextInput
        value={title}
        onChangeText={(value) => {
          console.log("^_^ Log \n file: add.tsx:13 \n value:", value);
          setEstate({ title: value });
        }}
        style={{
          borderBottomWidth: 1,
          borderColor: "gray",
          paddingHorizontal: 10,
          marginHorizontal: 20,
          fontSize: 22,
          color: "#F0F0F0",
          paddingVertical: 5,
          marginTop: 20,
        }}
        placeholder={n({ default: "Title", jp: "作品名" })}
        placeholderTextColor={"gray"}
        maxLength={50}
        autoFocus
      />
      <TextInput
        editable
        value={description}
        onChangeText={(value) => {
          setEstate({ description: value });
        }}
        style={{
          borderBottomWidth: 1,
          borderColor: "gray",
          paddingHorizontal: 10,
          marginHorizontal: 20,
          fontSize: 22,
          color: "#F0F0F0",
          paddingVertical: 5,
          marginTop: 20,
        }}
        placeholder={n({ default: "Description", jp: "作品の概要" })}
        placeholderTextColor={"gray"}
        maxLength={1000}
        multiline
        numberOfLines={4}
      />
      <View
        style={{
          flexDirection: "row",
          margin: 20,
          padding: 10,
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: "gray",
        }}
      >
        <View style={{ flexGrow: 1 }}>
          <Text style={{ fontSize: 18 }}>
            {n({ default: "Use Basic template", jp: "ベーシックテンプレートを使用" })}
          </Text>
        </View>
        <Switch
          value={template === "basic"}
          onValueChange={(bool) => {
            if (bool) setEstates.persist({ template: "basic" });
            else setEstates.persist({ template: null });
          }}
          ios_backgroundColor={"#000030"}
        />
      </View>
    </SafeAreaView>
  );
}
