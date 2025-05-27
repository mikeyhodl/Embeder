/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Playlist,
  PlaylistVideo,
  getAllPlaylists,
  deleteVideoFromPlaylist,
  updateVideoInPlaylist,
  updateVideoUrlFromUpdateUrl,
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
  const [editLogo, setEditLogo] = useState("");
  const [editUpdateUrl, setEditUpdateUrl] = useState("");
  const [videoToDelete, setVideoToDelete] = useState<{
    playlistName: string;
    videoTitle: string;
  } | null>(null);

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
        setVideoToDelete(null);
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
    setEditLogo(video.logo || "");
    setEditUpdateUrl(video.updateUrl || "");
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
          logo: editLogo.trim() || undefined,
          updateUrl: editUpdateUrl.trim() || undefined,
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

  const handleUpdateUrl = async (
    playlistName: string,
    video: PlaylistVideo
  ) => {
    if (!video.updateUrl) {
      toast.error("No update URL configured for this video");
      return;
    }

    const toastId = toast.loading("Updating video URL...");
    try {
      const success = await updateVideoUrlFromUpdateUrl(
        playlistName,
        video.title
      );

      if (success) {
        const updatedPlaylists = await getAllPlaylists();
        setPlaylists(updatedPlaylists);
        toast.success("Video URL updated successfully", { id: toastId });
      } else {
        toast.error("Failed to update video URL", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to update video URL", { id: toastId });
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
                    <input
                      type="text"
                      value={editLogo}
                      onChange={(e) => setEditLogo(e.target.value)}
                      className="w-full p-1 border rounded"
                      placeholder="Video Logo URL (optional)"
                    />
                    <input
                      type="text"
                      value={editUpdateUrl}
                      onChange={(e) => setEditUpdateUrl(e.target.value)}
                      className="w-full p-1 border rounded"
                      placeholder="Update URL (optional)"
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
                ) : videoToDelete?.playlistName === playlist.name &&
                  videoToDelete?.videoTitle === video.title ? (
                  <div className="space-y-2 p-2 bg-red-50 rounded">
                    <p className="text-red-600 font-medium">
                      Are you sure you want to delete this video?
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleDeleteVideo(playlist.name, video.title)
                        }
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setVideoToDelete(null)}
                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <div className="flex items-center space-x-2">
                      {video.logo && (
                        <Image
                          src={video.logo}
                          alt={`${video.title} logo`}
                          width={32}
                          height={32}
                          className="object-cover rounded"
                        />
                      )}
                      <span className="flex-grow truncate">{video.title}</span>
                    </div>
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
                      {video.updateUrl && (
                        <button
                          onClick={() => handleUpdateUrl(playlist.name, video)}
                          className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                          title="Update URL"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setVideoToDelete({
                            playlistName: playlist.name,
                            videoTitle: video.title,
                          })
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
