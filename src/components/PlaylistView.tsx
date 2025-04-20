/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Playlist,
  PlaylistVideo,
  getAllPlaylists,
  deleteVideoFromPlaylist,
  updateVideoInPlaylist,
} from "@/lib/functions";

interface PlaylistViewProps {
  updateTrigger: number;
  onVideoSelect: (video: PlaylistVideo) => void;
}

export default function PlaylistView({
  updateTrigger,
  onVideoSelect,
}: PlaylistViewProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [editingVideo, setEditingVideo] = useState<PlaylistVideo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

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
  }, [updateTrigger]);

  const handleDeleteVideo = async (
    playlistName: string,
    videoTitle: string
  ) => {
    const toastId = toast.loading("Deleting video...");
    try {
      const success = await deleteVideoFromPlaylist(playlistName, videoTitle);
      if (success) {
        const updatedPlaylists = await getAllPlaylists();
        setPlaylists(updatedPlaylists);
        toast.success("Video deleted successfully", { id: toastId });
      } else {
        toast.error("Failed to delete video", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to delete video", { id: toastId });
    }
  };

  const handleEditVideo = (playlistName: string, video: PlaylistVideo) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditUrl(video.url);
  };

  const handleSaveEdit = async (playlistName: string) => {
    if (!editingVideo) {
      toast.error("No video selected for editing");
      return;
    }
    if (!editTitle.trim() || !editUrl.trim()) {
      toast.error("Title and URL cannot be empty");
      return;
    }

    const toastId = toast.loading("Updating video...");
    try {
      const success = await updateVideoInPlaylist(
        playlistName,
        editingVideo.title,
        {
          title: editTitle,
          url: editUrl,
        }
      );

      if (success) {
        const updatedPlaylists = await getAllPlaylists();
        setPlaylists(updatedPlaylists);
        setEditingVideo(null);
        toast.success("Video updated successfully", { id: toastId });
      } else {
        toast.error("Failed to update video", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to update video", { id: toastId });
    }
  };

  return (
    <div className="w-full">
      {playlists.map((playlist) => (
        <details
          key={playlist.name}
          className="border rounded p-4 mb-4"
          open={false}
        >
          <summary className="font-bold mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            {playlist.name}
          </summary>
          <ul className="space-y-2 mt-4">
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
                        onClick={() => onVideoSelect(video)}
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
        </details>
      ))}
    </div>
  );
}
