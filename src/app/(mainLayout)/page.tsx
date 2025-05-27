"use client";
import { useState } from "react";
import PlaylistForm from "@/components/PlaylistForm";
import PlaylistView from "@/components/PlaylistView";
import VideoPlayer from "@/components/VideoPlayer";

interface PlaylistVideo {
  title: string;
  url: string;
}

export default function Home() {
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<PlaylistVideo | null>(null);

  const handlePlaylistUpdate = () => {
    setUpdateTrigger((prev) => prev + 1);
  };

  const handleVideoSelect = (video: PlaylistVideo) => {
    setCurrentVideo(video);
  };

  return (
    <div className="min-h-screen p-8">
      {/* <h1 className="text-3xl font-bold mb-8">Video Player App</h1> */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="md:w-1/2 lg:w-1/2 xl:w-1/2 2xl:w-1/2 space-y-8">
          <PlaylistForm onPlaylistUpdate={handlePlaylistUpdate} />
          <PlaylistView
            updateTrigger={updateTrigger}
            onVideoSelect={handleVideoSelect}
          />
        </div>
        <div className="md:w-1/2 lg:w-1/2 xl:w-1/2 2xl:w-1/2">
          <div className="sticky top-28">
            <VideoPlayer currentVideo={currentVideo} />
          </div>
        </div>
      </div>
    </div>
  );
}
