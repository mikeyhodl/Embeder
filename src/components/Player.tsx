import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

interface PlayerProps {
  title: string;
  src: string;
}

export default function Player({ title, src }: PlayerProps) {
  return (
    <>
      <MediaPlayer
        viewType="video"
        title={title}
        src={[{ src, type: "video/mp4" }]}
        autoPlay
        crossOrigin="anonymous"
        playsInline={true}
      >
        <MediaProvider />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
      {/* <video id="my-video" className="video-js" controls preload="auto" loop>
        <source src={src} type="video/mp4" />
      </video> */}
    </>
  );
}
