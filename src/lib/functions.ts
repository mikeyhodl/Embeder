"use server";

import { query, ensureDatabaseInitialized } from "./db";
import { cache } from "react";
import { revalidatePath } from "next/cache";

export interface PlaylistVideo {
  title: string;
  url: string;
  logo?: string;
  updateUrl?: string;
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
  updateUrl?: string;
}

// Get all playlists with their videos
export const getAllPlaylists = cache(async (): Promise<Playlist[]> => {
  try {
    await ensureDatabaseInitialized();
    // console.log("Fetching playlists..."); // Debug log

    const result = await query(`
      SELECT p.name, v.title, v.url, v.logo, v."updateUrl"
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
        updateUrl: row.updateUrl || undefined,
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
  } catch {
    // console.error("Error fetching playlists:", error);
    return [];
  }
});

// Create a new playlist
export async function createPlaylist(name: string): Promise<Playlist | null> {
  try {
    await ensureDatabaseInitialized();
    await query(
      'INSERT INTO "Playlist" (name) VALUES ($1) RETURNING id',
      [name]
    );

    revalidatePath("/");
    return {
      name,
      videos: [],
    };
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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
      SET title = $1, url = $2, logo = $3, "updateUrl" = $4
      FROM \"Playlist\" p
      WHERE v.\"playlistId\" = p.id
      AND p.name = $5
      AND v.title = $6
    `,
      [
        newVideo.title,
        newVideo.url,
        newVideo.logo || null,
        newVideo.updateUrl || null,
        playlistName,
        oldTitle,
      ]
    );

    revalidatePath("/");
    return result.rowCount !== null && result.rowCount > 0;
  } catch {
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
  } catch {
    // console.error("Error updating playlist:", error);
    return false;
  }
}

export async function updateVideoUrlFromUpdateUrl(
  playlistName: string,
  videoTitle: string
): Promise<boolean> {
  try {
    await ensureDatabaseInitialized();

    // First get the video's update URL
    const videoResult = await query(
      `
      SELECT v.url, v."updateUrl"
      FROM "Video" v
      JOIN "Playlist" p ON v."playlistId" = p.id
      WHERE p.name = $1 AND v.title = $2
      `,
      [playlistName, videoTitle]
    );

    if (videoResult.rows.length === 0 || !videoResult.rows[0].updateUrl) {
      console.error(
        `No video found or no updateUrl for playlist: ${playlistName}, video: ${videoTitle}`
      );
      return false;
    }

    const updateUrl = videoResult.rows[0].updateUrl;

    // Fetch the updated URL with custom headers
    const response = await fetch(updateUrl, {
      method: 'GET',
      headers: {
        'Authority': 'tvpass.org',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-GB,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,ru;q=0.5,it;q=0.4',
        'Cache-Control': 'no-cache',
        'Cookie': 'XSRF-TOKEN=eyJpdiI6InkzR0xPK3o3bll2dGhYdjN3VDA5dlE9PSIsInZhbHVlIjoid2NKL1d1TWZQR2NHY01xWm9JWWpGYzNkL1RQQW0wazZRaU5saGt1LzN2VmU5Uno3bmlXY2ovN1Z1ODZSWUJWb1U5TGZ2OEd0Mzg0WE5VRFduK2t0Tks2SDNDVGRKbHFKM1JTMVg3dC9iaXZRczNVaEZiT2FKVFVkRC9zRVN6MTYiLCJtYWMiOiI4ZGZkYTZmZjliM2FiZmRkOGE4ODBmMGE5ODIxMDY2MGVjYWVjMjVjZWQyOGMyMTRkODgzODhlMjU4YzU3NjRlIiwidGFnIjoiIn0%3D; tvpass_session=eyJpdiI6Im9DVmJqMWpraW5TajJWZkMybzk0blE9PSIsInZhbHVlIjoiUmpWbUVXYWV1U28wVzFvTWFhUGhuKzhFOGF5T1ZkbDg2T3pzdnRyUTI3eEo0Z2pjWUpVb25zV3N5VlhjM0t2UXFEQjNMdG02TGZLMUl4Z3o0MEVuT09sSHI5Z01JSDlBSzlwYkRoeW1DOGlXY1hMTlFDWHp0ZU5rVThIVG1XQ1kiLCJtYWMiOiIzMGI3NTI5M2UzY2IyYTVlN2U2NmIyYzUzODg1YzdhYmZiNDVhY2VhNDE2MGM5NjJlZGJlMTJiYTkxNjEyY2Y5IiwidGFnIjoiIn0%3D',
        'DNT': '1',
        'Pragma': 'no-cache',
        'Priority': 'u=1, i',
        'Referer': 'https://tvpass.org/channel/ae-us-eastern-feed',
        'Sec-Ch-Ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
      }
    });

    const data = await response.json();

    if (data.status !== "true" || !data.url) {
      console.error(
        `Invalid response from updateUrl: ${updateUrl}, status: ${data.status}, url: ${data.url}`
      );
      return false;
    }

    // Update the video URL
    const result = await query(
      `
      UPDATE "Video" v
      SET url = $1
      FROM "Playlist" p
      WHERE v."playlistId" = p.id
      AND p.name = $2
      AND v.title = $3
      `,
      [data.url, playlistName, videoTitle]
    );

    revalidatePath("/");
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error(
      `Error updating video URL for playlist: ${playlistName}, video: ${videoTitle}`,
      error
    );
    return false;
  }
}