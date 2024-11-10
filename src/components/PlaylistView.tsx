"use client";
import { useState, useEffect } from "react";
import Player from "./Player";

interface PlaylistVideo {
  title: string;
  url: string;
}

interface Playlist {
  name: string;
  videos: PlaylistVideo[];
}

interface PlaylistViewProps {
  updateTrigger: number;
}

export default function PlaylistView({ updateTrigger }: PlaylistViewProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentVideo, setCurrentVideo] = useState<PlaylistVideo | null>(null);
  const [editingVideo, setEditingVideo] = useState<PlaylistVideo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  useEffect(() => {
    const savedPlaylists = JSON.parse(
      localStorage.getItem("playlists") || "[]"
    );
    setPlaylists(savedPlaylists);
  }, [updateTrigger]);

  const handleDeleteVideo = (playlistName: string, videoTitle: string) => {
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.name === playlistName) {
        return {
          ...playlist,
          videos: playlist.videos.filter((video) => video.title !== videoTitle),
        };
      }
      return playlist;
    });

    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
    if (currentVideo?.title === videoTitle) {
      setCurrentVideo(null);
    }
  };

  const handleEditVideo = (playlistName: string, video: PlaylistVideo) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditUrl(video.url);
  };

  const handleSaveEdit = (playlistName: string) => {
    if (!editingVideo || !editTitle.trim() || !editUrl.trim()) return;

    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.name === playlistName) {
        return {
          ...playlist,
          videos: playlist.videos.map((video) =>
            video.title === editingVideo.title
              ? { title: editTitle, url: editUrl }
              : video
          ),
        };
      }
      return playlist;
    });

    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
    setEditingVideo(null);
    if (currentVideo?.title === editingVideo.title) {
      setCurrentVideo({ title: editTitle, url: editUrl });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      <div className="md:w-1/3 space-y-4">
        {playlists.map((playlist) => (
          <div key={playlist.name} className="border rounded p-4">
            <h3 className="font-bold mb-2">{playlist.name}</h3>
            <ul className="space-y-2">
              {playlist.videos.map((video) => (
                <li key={video.title} className="space-y-2">
                  {editingVideo?.title === video.title ? (
                    <div className="space-y-2 p-2 bg-gray-50 rounded">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-1 border rounded"
                        placeholder="Video Title"
                      />
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="w-full p-1 border rounded"
                        placeholder="Video URL"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveEdit(playlist.name)}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingVideo(null)}
                          className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span className="flex-grow truncate">{video.title}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentVideo(video)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Play
                        </button>
                        <button
                          onClick={() => handleEditVideo(playlist.name, video)}
                          className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteVideo(playlist.name, video.title)
                          }
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="md:w-2/3">
        {currentVideo ? (
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <h2 className="text-xl font-bold mb-2">Now Playing:</h2>
              <p>{currentVideo.title}</p>
            </div>
            <div className="w-full min-h-[400px]">
              <Player title={currentVideo.title} src={currentVideo.url} />
            </div>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded p-8">
            <p className="text-gray-500">Select a video to play</p>
          </div>
        )}
      </div>
    </div>
  );
}
