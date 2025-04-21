import { PrismaClient } from "../prisma/generated/client";
import * as fs from 'fs';
import * as path from 'path';

interface Video {
    title: string;
    url: string;
}

interface PlaylistData {
    name: string;
    videos: Video[];
}

const prisma = new PrismaClient();

async function main() {
    try {
        // Read the JSON file
        const jsonData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../data.json'), 'utf-8')
        ) as PlaylistData[];

        // Process each playlist
        for (const playlistData of jsonData) {
            // Create playlist
            const playlist = await prisma.playlist.create({
                data: {
                    name: playlistData.name,
                    videos: {
                        create: playlistData.videos.map((video) => ({
                            title: video.title,
                            url: video.url,
                        })),
                    },
                },
            });

            console.log(`Created playlist: ${playlist.name} with ${playlistData.videos.length} videos`);
        }

        console.log('Data import completed successfully!');
    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 