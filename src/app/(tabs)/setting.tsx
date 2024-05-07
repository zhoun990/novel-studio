import { clearEstate, setEstates, useEstate } from "@/utils/estate";
import { supabase } from "@/utils/supabase";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { ReactNode, useState } from "react";
import { Button, Image, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import jsPDF from "jspdf";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { getObjectKeys } from "@/utils/getObjectKeys";
import Text from "@/components/CustomText";
import { n } from "@/utils/n";

export default function App() {
  const { session } = useEstate("main");
  const headerHeight = useHeaderHeight();
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        position: "relative",
        backgroundColor: "#000015",
        paddingTop: top + headerHeight,
      }}
    >
      <View
        style={{
          paddingTop: 4,
          paddingBottom: 4,
          alignSelf: "stretch",
          // backgroundColor: "green",
        }}
      >
        <Button
          title={session?.user ? "サインアウト" : "サインイン"}
          onPress={async () => {
            if (session?.user) {
              await supabase.auth.signOut();

              clearEstate("main");
              setEstates.persist({
                archive: {},
                novels: (cv) => {
                  Object.keys(cv).forEach((key) => {
                    cv[key].user_id = null;
                  });
                  return cv;
                },
                episodes: (cv) => {
                  Object.keys(cv).forEach((key) => {
                    cv[key].user_id = null;
                  });
                  return cv;
                },
              });
            } else {
              router.push("/auth");
            }
          }}
        />
        <PdfExportButton />
      </View>
    </View>
  );
}
const BlurHeader = ({
  left,
  mid,
  right,
  tint = "dark",
}: {
  left?: ReactNode;
  mid?: ReactNode;
  right?: ReactNode;
  tint?: BlurView["props"]["tint"];
}) => {
  const { top } = useSafeAreaInsets();

  return (
    <BlurView
      intensity={50}
      tint="dark"
      style={{
        position: "absolute",
        paddingTop: top,
        width: "100%",
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      <View
        style={{
          height: 45,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ flexGrow: 1 }}>{left}</View>
        <View>{mid}</View>
        <View style={{ flexGrow: 1, justifyContent: "flex-end" }}>{right}</View>
      </View>
    </BlurView>
  );
};
const PdfExportButton = () => {
  const { episodes, novels, docs, plots, groupeRecord, setEstate } = useEstate("persist");
  const handleExport = () => {
    // PDF出力のロジック
    const lines: string[] = [];
    for (let index = 0; index < Object.keys(novels).length; index++) {
      const novel_id = Object.keys(novels)[index];
      lines.push(`|${novels[novel_id].title}|`);
      getObjectKeys(novels[novel_id]).forEach((key) => {
        if (key === "title" || key === "groups") {
        } else if (key === "episodes_list") {
          lines.push("\n---Episodes---");
          novels[novel_id][key].forEach((episode_id, i) => {
            const episode = episodes[episode_id];
            if (episode) {
              lines.push("\n");
              lines.push(`${i + 1}. ${episode.title || ""}`);
              lines.push(episode.text || "");
              lines.push("\n");
            }
          });
        } else if (key === "doc_groups") {
          lines.push("\n---Documents---");
          novels[novel_id][key].forEach((doc_groupe_id) => {
            const groupe = groupeRecord[doc_groupe_id];
            if (groupe) {
              lines.push(`# ${groupe.title || ""}`);
              groupe.list.forEach((doc_id) => {
                const doc = docs[doc_id];
                if (doc && doc.title?.length) {
                  doc.title.forEach((title, i) => {
                    lines.push("## " + title || "");
                    lines.push(doc.text[i] || "");
                  });
                }
              });
            }
          });
        } else if (key === "plot_groups") {
          lines.push("\n---Plots---");
          novels[novel_id][key].forEach((plot_groupe_id) => {
            const groupe = groupeRecord[plot_groupe_id];
            if (groupe) {
              lines.push(`# ${groupe.title}`);
              groupe.list.forEach((plot_id, i) => {
                const plot = plots[plot_id];
                if (plot?.text) {
                  lines.push(`${i + 1}: ${plot.text}`);
                }
              });
            }
          });
        } else {
          const value = novels[novel_id][key];
          if (value) {
            lines.push(`\n---${key}---`);
            lines.push(String(value));
          }
        }
      });
      lines.push(`\n\n\n`);
    }

    let html = `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
  </head>
  <body style="text-align: center;">`;
    lines.forEach((line) => (html += `<p>${line}</p>`));
    html += `</body>
</html>`;
    return html;
  };
  const [selectedPrinter, setSelectedPrinter] = useState<Print.Printer>();

  const print = async () => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    await Print.printAsync({
      html: handleExport(),
      printerUrl: selectedPrinter?.url, // iOS only
    });
  };

  const printToFile = async () => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    const { uri } = await Print.printToFileAsync({ html: handleExport() });
    console.log("File has been saved to:", uri);
    await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  };

  const selectPrinter = async () => {
    const printer = await Print.selectPrinterAsync(); // iOS only
    setSelectedPrinter(printer);
  };

  return (
    <View style={{}}>
      <Button
        title={n({ default: "Export all novels", jp: "全ての作品をエクスポート" })}
        onPress={printToFile}
      />
    </View>
  );
};
