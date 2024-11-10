"use client";
import { useState, useEffect } from "react";

interface PlaylistVideo {
  title: string;
  url: string;
}

interface Playlist {
  name: string;
  videos: PlaylistVideo[];
}

interface PlaylistFormProps {
  onPlaylistUpdate: () => void;
}

export default function PlaylistForm({ onPlaylistUpdate }: PlaylistFormProps) {
  const [playlistName, setPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const savedPlaylists = JSON.parse(
      localStorage.getItem("playlists") || "[]"
    );
    setPlaylists(savedPlaylists);
  }, []);

  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) return;

    const newPlaylist: Playlist = {
      name: playlistName,
      videos: [],
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
    setPlaylistName("");
    onPlaylistUpdate();
  };

  const handleAddVideo = () => {
    if (!selectedPlaylist || !videoTitle.trim() || !videoUrl.trim()) return;

    const updatedPlaylists = playlists.map((playlist: Playlist) => {
      if (playlist.name === selectedPlaylist) {
        return {
          ...playlist,
          videos: [...playlist.videos, { title: videoTitle, url: videoUrl }],
        };
      }
      return playlist;
    });

    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
    setVideoTitle("");
    setVideoUrl("");
    onPlaylistUpdate();
  };

  const handleDeletePlaylist = (playlistName: string) => {
    const updatedPlaylists = playlists.filter((p) => p.name !== playlistName);
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
    setSelectedPlaylist(null);
    onPlaylistUpdate();
  };

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Create Playlist</h2>
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="Playlist Name"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleCreatePlaylist}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Playlist
        </button>
      </div>

      {playlists.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Select Playlist to Add Videos</h2>
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <div key={playlist.name} className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedPlaylist(playlist.name)}
                  className={`px-4 py-2 rounded ${
                    selectedPlaylist === playlist.name
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {playlist.name}
                </button>
                <button
                  onClick={() => handleDeletePlaylist(playlist.name)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPlaylist && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Add Video to {selectedPlaylist}</h2>
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Video Title"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Video URL"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleAddVideo}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Video
          </button>
        </div>
      )}
    </div>
  );
}
