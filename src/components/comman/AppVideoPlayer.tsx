import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

export type AppVideoPlayerProps = {
  uri: string;
  shouldPlay?: boolean;
  contentFit?: "contain" | "cover";
  style?: any;
};

const AppVideoPlayer: React.FC<AppVideoPlayerProps> = ({
  uri,
  shouldPlay = true,
  contentFit = "contain",
  style,
}) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    if (!player) return;
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0;
    }
  }, [shouldPlay, player]);

  return (
    <View style={[styles.container, style]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        nativeControls={true}
        contentFit={contentFit}
      />
    </View>
  );
};

export default AppVideoPlayer;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
  },
});
