-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_playlistId_fkey";

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
