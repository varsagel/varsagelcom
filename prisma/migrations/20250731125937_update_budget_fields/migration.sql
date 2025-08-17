/*
  Warnings:

  - You are about to drop the column `budget` on the `Listing` table. All the data in the column will be lost.
  - Added the required column `budgetMax` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `budgetMin` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "budgetMin" REAL NOT NULL,
    "budgetMax" REAL NOT NULL,
    "images" TEXT NOT NULL,
    "videoUrl" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("category", "createdAt", "description", "expiresAt", "favoriteCount", "id", "images", "likeCount", "location", "status", "title", "updatedAt", "userId", "videoUrl", "budgetMin", "budgetMax") SELECT "category", "createdAt", "description", "expiresAt", "favoriteCount", "id", "images", "likeCount", "location", "status", "title", "updatedAt", "userId", "videoUrl", "budget", "budget" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
