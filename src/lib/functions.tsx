"use server";
import {
  PrismaClient,
  Playlist as PrismaPlaylist,
  Video as PrismaVideo,
} from "@prisma/client";

const prisma = new PrismaClient();

export interface PlaylistVideo {
  title: string;
  url: string;
}

export interface Playlist {
  name: string;
  videos: PlaylistVideo[];
}

// Get all playlists with their videos
export async function getAllPlaylists(): Promise<Playlist[]> {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        videos: true,
      },
    });

    return playlists.map(
      (playlist: PrismaPlaylist & { videos: PrismaVideo[] }) => ({
        name: playlist.name,
        videos: playlist.videos.map((video: PrismaVideo) => ({
          title: video.title,
          url: video.url,
        })),
      })
    );
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return [];
  }
}

// Create a new playlist
export async function createPlaylist(name: string): Promise<Playlist | null> {
  try {
    const playlist = await prisma.playlist.create({
      data: {
        name,
      },
      include: {
        videos: true,
      },
    });

    return {
      name: playlist.name,
      videos: playlist.videos.map((video: PrismaVideo) => ({
        title: video.title,
        url: video.url,
      })),
    };
  } catch (error) {
    console.error("Error creating playlist:", error);
    return null;
  }
}

// Add a video to a playlist
export async function addVideoToPlaylist(
  playlistName: string,
  video: PlaylistVideo
): Promise<Playlist | null> {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { name: playlistName },
    });

    if (!playlist) return null;

    await prisma.video.create({
      data: {
        title: video.title,
        url: video.url,
        playlistId: playlist.id,
      },
    });

    const updatedPlaylist = await prisma.playlist.findUnique({
      where: { name: playlistName },
      include: {
        videos: true,
      },
    });

    if (!updatedPlaylist) return null;

    return {
      name: updatedPlaylist.name,
      videos: updatedPlaylist.videos.map((video: PrismaVideo) => ({
        title: video.title,
        url: video.url,
      })),
    };
  } catch (error) {
    console.error("Error adding video to playlist:", error);
    return null;
  }
}

// Delete a playlist
export async function deletePlaylist(name: string): Promise<boolean> {
  try {
    await prisma.playlist.delete({
      where: { name },
    });
    return true;
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return false;
  }
}

// Delete a video from a playlist
export async function deleteVideoFromPlaylist(
  playlistName: string,
  videoTitle: string
): Promise<boolean> {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { name: playlistName },
      include: { videos: true },
    });

    if (!playlist) return false;

    const video = playlist.videos.find(
      (v: PrismaVideo) => v.title === videoTitle
    );
    if (!video) return false;

    await prisma.video.delete({
      where: { id: video.id },
    });

    return true;
  } catch (error) {
    console.error("Error deleting video from playlist:", error);
    return false;
  }
}

// Update a video in a playlist
export async function updateVideoInPlaylist(
  playlistName: string,
  oldTitle: string,
  newVideo: PlaylistVideo
): Promise<boolean> {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { name: playlistName },
      include: { videos: true },
    });

    if (!playlist) return false;

    const video = playlist.videos.find(
      (v: PrismaVideo) => v.title === oldTitle
    );
    if (!video) return false;

    await prisma.video.update({
      where: { id: video.id },
      data: {
        title: newVideo.title,
        url: newVideo.url,
      },
    });

    return true;
  } catch (error) {
    console.error("Error updating video in playlist:", error);
    return false;
  }
}
