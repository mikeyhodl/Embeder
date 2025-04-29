"use server";

import { query, ensureDatabaseInitialized } from "./db";
import { cache } from "react";
import { revalidatePath } from "next/cache";

export interface PlaylistVideo {
  title: string;
  url: string;
  logo?: string;
}

export interface Playlist {
  name: string;
  videos: PlaylistVideo[];
}

interface DatabaseRow {
  name: string;
  title: string | null;
  url: string | null;
  logo?: string;
}

// Get all playlists with their videos
export const getAllPlaylists = cache(async (): Promise<Playlist[]> => {
  try {
    await ensureDatabaseInitialized();
    // console.log("Fetching playlists..."); // Debug log

    const result = await query(`
      SELECT p.name, v.title, v.url, v.logo
      FROM "Playlist" p
      LEFT JOIN "Video" v ON p.id = v."playlistId"
      ORDER BY p.name, v.title
    `);

    // console.log("Query result:", result.rows); // Debug log

    // Group videos by playlist
    const playlistsMap = new Map<string, PlaylistVideo[]>();
    result.rows.forEach((row: DatabaseRow) => {
      if (!row.title) {
        // If no videos, add an empty playlist
        if (!playlistsMap.has(row.name)) {
          playlistsMap.set(row.name, []);
        }
        return;
      }
      const videos = playlistsMap.get(row.name) || [];
      videos.push({
        title: row.title,
        url: row.url!,
        logo: row.logo || undefined,
      });
      playlistsMap.set(row.name, videos);
    });

    const playlists = Array.from(playlistsMap.entries()).map(
      ([name, videos]) => ({
        name,
        videos,
      })
    );

    // console.log("Processed playlists:", playlists); // Debug log
    return playlists;
  } catch (error) {
    // console.error("Error fetching playlists:", error);
    return [];
  }
});

// Create a new playlist
export async function createPlaylist(name: string): Promise<Playlist | null> {
  try {
    await ensureDatabaseInitialized();
    const result = await query(
      'INSERT INTO "Playlist" (name) VALUES ($1) RETURNING id',
      [name]
    );

    revalidatePath("/");
    return {
      name,
      videos: [],
    };
  } catch (error) {
    // console.error("Error creating playlist:", error);
    return null;
  }
}

// Add a video to a playlist
export async function addVideoToPlaylist(
  playlistName: string,
  video: PlaylistVideo
): Promise<Playlist | null> {
  try {
    await ensureDatabaseInitialized();
    // First get the playlist ID
    const playlistResult = await query(
      'SELECT id FROM "Playlist" WHERE name = $1',
      [playlistName]
    );

    if (playlistResult.rows.length === 0) return null;
    const playlistId = playlistResult.rows[0].id;

    // Add the video
    await query(
      'INSERT INTO "Video" (title, url, "playlistId") VALUES ($1, $2, $3)',
      [video.title, video.url, playlistId]
    );

    // Get the updated playlist
    const result = await query(
      `
      SELECT p.name, v.title, v.url
      FROM \"Playlist\" p
      LEFT JOIN \"Video\" v ON p.id = v.\"playlistId\"
      WHERE p.name = $1
      ORDER BY v.title
    `,
      [playlistName]
    );

    const videos = result.rows
      .filter((row: DatabaseRow) => row.title) // Filter out null rows
      .map((row: DatabaseRow) => ({
        title: row.title!,
        url: row.url!,
      }));

    revalidatePath("/");
    return {
      name: playlistName,
      videos,
    };
  } catch (error) {
    // console.error("Error adding video to playlist:", error);
    return null;
  }
}

// Delete a playlist
export async function deletePlaylist(name: string): Promise<boolean> {
  try {
    await ensureDatabaseInitialized();
    await query('DELETE FROM "Playlist" WHERE name = $1', [name]);
    revalidatePath("/");
    return true;
  } catch (error) {
    // console.error("Error deleting playlist:", error);
    return false;
  }
}

// Delete a video from a playlist
export async function deleteVideoFromPlaylist(
  playlistName: string,
  videoTitle: string
): Promise<boolean> {
  try {
    await ensureDatabaseInitialized();
    const result = await query(
      `
      DELETE FROM \"Video\" v
      USING \"Playlist\" p
      WHERE v.\"playlistId\" = p.id
      AND p.name = $1
      AND v.title = $2
    `,
      [playlistName, videoTitle]
    );

    revalidatePath("/");
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    // console.error("Error deleting video from playlist:", error);
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
    await ensureDatabaseInitialized();
    const result = await query(
      `
      UPDATE \"Video\" v
      SET title = $1, url = $2, logo = $3
      FROM \"Playlist\" p
      WHERE v.\"playlistId\" = p.id
      AND p.name = $4
      AND v.title = $5
    `,
      [
        newVideo.title,
        newVideo.url,
        newVideo.logo || null,
        playlistName,
        oldTitle,
      ]
    );

    revalidatePath("/");
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    // console.error("Error updating video in playlist:", error);
    return false;
  }
}

// Update a playlist name
export async function updatePlaylist(
  oldName: string,
  newName: string
): Promise<boolean> {
  try {
    await ensureDatabaseInitialized();
    const result = await query(
      'UPDATE "Playlist" SET name = $1 WHERE name = $2',
      [newName, oldName]
    );

    revalidatePath("/");
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    // console.error("Error updating playlist:", error);
    return false;
  }
}
