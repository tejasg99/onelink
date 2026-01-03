-- CreateEnum
CREATE TYPE "OneLinkType" AS ENUM ('TEXT', 'CODE', 'FILE', 'LINKS');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'UNLISTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "username" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "sessions" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "onelinks" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "type" "OneLinkType" NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'UNLISTED',
    "expiresAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "onelinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_contents" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onelinkId" TEXT NOT NULL,

    CONSTRAINT "text_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_contents" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'plaintext',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onelinkId" TEXT NOT NULL,

    CONSTRAINT "code_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_contents" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onelinkId" TEXT NOT NULL,

    CONSTRAINT "file_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bio_links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onelinkId" TEXT NOT NULL,

    CONSTRAINT "bio_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "onelinks_slug_key" ON "onelinks"("slug");

-- CreateIndex
CREATE INDEX "onelinks_slug_idx" ON "onelinks"("slug");

-- CreateIndex
CREATE INDEX "onelinks_userId_idx" ON "onelinks"("userId");

-- CreateIndex
CREATE INDEX "onelinks_expiresAt_idx" ON "onelinks"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "text_contents_onelinkId_key" ON "text_contents"("onelinkId");

-- CreateIndex
CREATE UNIQUE INDEX "code_contents_onelinkId_key" ON "code_contents"("onelinkId");

-- CreateIndex
CREATE UNIQUE INDEX "file_contents_onelinkId_key" ON "file_contents"("onelinkId");

-- CreateIndex
CREATE INDEX "bio_links_onelinkId_idx" ON "bio_links"("onelinkId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onelinks" ADD CONSTRAINT "onelinks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_contents" ADD CONSTRAINT "text_contents_onelinkId_fkey" FOREIGN KEY ("onelinkId") REFERENCES "onelinks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_contents" ADD CONSTRAINT "code_contents_onelinkId_fkey" FOREIGN KEY ("onelinkId") REFERENCES "onelinks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_contents" ADD CONSTRAINT "file_contents_onelinkId_fkey" FOREIGN KEY ("onelinkId") REFERENCES "onelinks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bio_links" ADD CONSTRAINT "bio_links_onelinkId_fkey" FOREIGN KEY ("onelinkId") REFERENCES "onelinks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
