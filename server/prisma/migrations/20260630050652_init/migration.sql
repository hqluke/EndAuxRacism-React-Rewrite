-- CreateTable
CREATE TABLE "SpotifyUser" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "refreshTokenEncrypted" TEXT,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotifyUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppleUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppleUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "ownerAppleUserId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResetToken" (
    "id" TEXT NOT NULL,
    "appleUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "appleSongUrl" TEXT NOT NULL,
    "itunesTrackId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT NOT NULL,
    "artworkUrl" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "isStreamable" BOOLEAN NOT NULL DEFAULT true,
    "spotifyTrackId" TEXT,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyUser_email_key" ON "SpotifyUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AppleUser_email_key" ON "AppleUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AppleUser_username_key" ON "AppleUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ResetToken_tokenHash_key" ON "ResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "Track_itunesTrackId_idx" ON "Track"("itunesTrackId");

-- CreateIndex
CREATE INDEX "Track_spotifyTrackId_idx" ON "Track"("spotifyTrackId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_playlistId_position_key" ON "Track"("playlistId", "position");

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_ownerAppleUserId_fkey" FOREIGN KEY ("ownerAppleUserId") REFERENCES "AppleUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResetToken" ADD CONSTRAINT "ResetToken_appleUserId_fkey" FOREIGN KEY ("appleUserId") REFERENCES "AppleUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
