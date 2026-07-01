-- Split SpotifyUser.id into an internal cuid (used in sessions) and a
-- separate spotifyId column (Spotify's own user ID).
ALTER TABLE "SpotifyUser" ADD COLUMN     "spotifyId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyUser_spotifyId_key" ON "SpotifyUser"("spotifyId");
