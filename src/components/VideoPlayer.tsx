import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

interface VideoPlayerProps {
  currentVideo: {
    title: string;
    url: string;
  } | null;
}

export default function VideoPlayer({ currentVideo }: VideoPlayerProps) {
  if (!currentVideo) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded p-8">
        <p className="text-gray-500">Select a video to play</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Now Playing:</h2>
        <p className="text-xl font-bold mb-2 text-blue-600">
          {currentVideo.title}
        </p>
      </div>
      <div className="w-full flex items-center justify-center bg-gray-100 rounded p-8">
        <MediaPlayer
          viewType="video"
          title={currentVideo.title}
          src={[{ src: currentVideo.url, type: "video/mp4" }]}
          autoPlay
          playsInline={true}
        >
          <MediaProvider />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      </div>
    </div>
  );
}
