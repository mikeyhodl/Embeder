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
  updatePlaylist,
} from "@/lib/functions";

interface PlaylistFormProps {
  onPlaylistUpdate: () => void;
}

export default function PlaylistForm({ onPlaylistUpdate }: PlaylistFormProps) {
  const [playlistName, setPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLogo, setVideoLogo] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null);
  const [editPlaylistName, setEditPlaylistName] = useState("");
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);

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
        logo: videoLogo.trim() || undefined,
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
        setVideoLogo("");
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
        setPlaylistToDelete(null);
        onPlaylistUpdate();
        toast.success("Playlist deleted successfully", { id: toastId });
      } else {
        toast.error("Failed to delete playlist", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to delete playlist", { id: toastId });
    }
  };

  const handleEditPlaylist = async (playlistName: string) => {
    if (!editPlaylistName.trim()) {
      toast.error("Playlist name cannot be empty");
      return;
    }

    const toastId = toast.loading("Updating playlist...");
    try {
      const success = await updatePlaylist(playlistName, editPlaylistName);
      if (success) {
        setPlaylists(
          playlists.map((p) =>
            p.name === playlistName ? { ...p, name: editPlaylistName } : p
          )
        );
        setEditingPlaylist(null);
        setEditPlaylistName("");
        onPlaylistUpdate();
        toast.success("Playlist updated successfully", { id: toastId });
      } else {
        toast.error("Failed to update playlist", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to update playlist", { id: toastId });
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
                {editingPlaylist === playlist.name ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editPlaylistName}
                      onChange={(e) => setEditPlaylistName(e.target.value)}
                      placeholder="New Playlist Name"
                      className="p-2 border rounded"
                    />
                    <button
                      onClick={() => handleEditPlaylist(playlist.name)}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingPlaylist(null);
                        setEditPlaylistName("");
                      }}
                      className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : playlistToDelete === playlist.name ? (
                  <div className="space-y-2 p-2 bg-red-50 rounded">
                    <p className="text-red-600 font-medium">
                      Are you sure you want to delete this playlist?
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeletePlaylist(playlist.name)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setPlaylistToDelete(null)}
                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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
                      onClick={() => {
                        setEditingPlaylist(playlist.name);
                        setEditPlaylistName(playlist.name);
                      }}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setPlaylistToDelete(playlist.name)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </>
                )}
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
          <input
            type="text"
            value={videoLogo}
            onChange={(e) => setVideoLogo(e.target.value)}
            placeholder="Video Logo URL (optional)"
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
