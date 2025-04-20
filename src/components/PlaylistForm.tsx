/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Playlist,
  PlaylistVideo,
  createPlaylist,
  addVideoToPlaylist,
  deletePlaylist,
  getAllPlaylists,
} from "@/lib/functions";

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
    const fetchPlaylists = async () => {
      try {
        const fetchedPlaylists = await getAllPlaylists();
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        toast.error("Failed to fetch playlists");
      }
    };
    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error("Playlist name cannot be empty");
      return;
    }

    const toastId = toast.loading("Creating playlist...");
    try {
      const newPlaylist = await createPlaylist(playlistName);
      if (newPlaylist) {
        setPlaylists([...playlists, newPlaylist]);
        setPlaylistName("");
        onPlaylistUpdate();
        toast.success("Playlist created successfully", { id: toastId });
      } else {
        toast.error("Failed to create playlist", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to create playlist", { id: toastId });
    }
  };

  const handleAddVideo = async () => {
    if (!selectedPlaylist) {
      toast.error("Please select a playlist first");
      return;
    }
    if (!videoTitle.trim() || !videoUrl.trim()) {
      toast.error("Video title and URL cannot be empty");
      return;
    }

    const toastId = toast.loading("Adding video...");
    try {
      const video: PlaylistVideo = {
        title: videoTitle,
        url: videoUrl,
      };

      const updatedPlaylist = await addVideoToPlaylist(selectedPlaylist, video);
      if (updatedPlaylist) {
        setPlaylists(
          playlists.map((p) =>
            p.name === selectedPlaylist ? updatedPlaylist : p
          )
        );
        setVideoTitle("");
        setVideoUrl("");
        onPlaylistUpdate();
        toast.success("Video added successfully", { id: toastId });
      } else {
        toast.error("Failed to add video", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to add video", { id: toastId });
    }
  };

  const handleDeletePlaylist = async (playlistName: string) => {
    const toastId = toast.loading("Deleting playlist...");
    try {
      const success = await deletePlaylist(playlistName);
      if (success) {
        setPlaylists(playlists.filter((p) => p.name !== playlistName));
        setSelectedPlaylist(null);
        onPlaylistUpdate();
        toast.success("Playlist deleted successfully", { id: toastId });
      } else {
        toast.error("Failed to delete playlist", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to delete playlist", { id: toastId });
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-4 sticky top-28 bg-white z-30 p-4 shadow-md rounded-lg">
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
        <div className="w-full">
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
        <div className="w-full space-y-4">
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
