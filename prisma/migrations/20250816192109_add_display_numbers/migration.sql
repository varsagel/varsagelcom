/*
  Warnings:

  - Added the required column `displayNumber` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayNumber` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "location" TEXT NOT NULL,
    "district" TEXT,
    "budgetMin" REAL NOT NULL,
    "budgetMax" REAL NOT NULL,
    "price" REAL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" DATETIME,
    "images" TEXT NOT NULL,
    "videoUrl" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "categorySpecificData" JSONB,
    "mileageMin" INTEGER,
    "mileageMax" INTEGER,
    "icon" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("budgetMax", "budgetMin", "category", "categorySpecificData", "createdAt", "description", "district", "expiresAt", "favoriteCount", "featuredUntil", "icon", "id", "images", "isFeatured", "likeCount", "location", "mileageMax", "mileageMin", "price", "status", "subcategory", "title", "updatedAt", "userId", "videoUrl", "viewCount") SELECT "budgetMax", "budgetMin", "category", "categorySpecificData", "createdAt", "description", "district", "expiresAt", "favoriteCount", "featuredUntil", "icon", "id", "images", "isFeatured", "likeCount", "location", "mileageMax", "mileageMin", "price", "status", "subcategory", "title", "updatedAt", "userId", "videoUrl", "viewCount" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE UNIQUE INDEX "Listing_displayNumber_key" ON "Listing"("displayNumber");
CREATE TABLE "new_Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "duration" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "experience" TEXT NOT NULL DEFAULT '',
    "portfolio" TEXT NOT NULL DEFAULT '',
    "guaranteeOffered" BOOLEAN NOT NULL DEFAULT false,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "additionalServices" JSONB NOT NULL DEFAULT [],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categorySpecificData" JSONB,
    CONSTRAINT "Offer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Offer" ("additionalServices", "categorySpecificData", "createdAt", "duration", "experience", "guaranteeOffered", "id", "listingId", "message", "portfolio", "price", "revisionCount", "status", "updatedAt", "userId") SELECT "additionalServices", "categorySpecificData", "createdAt", "duration", "experience", "guaranteeOffered", "id", "listingId", "message", "portfolio", "price", "revisionCount", "status", "updatedAt", "userId" FROM "Offer";
DROP TABLE "Offer";
ALTER TABLE "new_Offer" RENAME TO "Offer";
CREATE UNIQUE INDEX "Offer_displayNumber_key" ON "Offer"("displayNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
