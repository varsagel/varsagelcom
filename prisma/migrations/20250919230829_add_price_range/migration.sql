/*
  Warnings:

  - You are about to drop the column `price` on the `listings` table. All the data in the column will be lost.
  - Added the required column `amount` to the `offers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "buyer_listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "minPrice" REAL NOT NULL,
    "maxPrice" REAL NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'medium',
    "condition" TEXT NOT NULL,
    "specifications" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "views" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "buyer_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minPrice" REAL,
    "maxPrice" REAL,
    "location" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subCategoryId" TEXT NOT NULL,
    "categorySpecificData" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "views" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_listings" ("categoryId", "categorySpecificData", "createdAt", "description", "expiresAt", "id", "images", "listingNumber", "location", "status", "subCategoryId", "title", "updatedAt", "userId", "views") SELECT "categoryId", "categorySpecificData", "createdAt", "description", "expiresAt", "id", "images", "listingNumber", "location", "status", "subCategoryId", "title", "updatedAt", "userId", "views" FROM "listings";
DROP TABLE "listings";
ALTER TABLE "new_listings" RENAME TO "listings";
CREATE UNIQUE INDEX "listings_listingNumber_key" ON "listings"("listingNumber");
CREATE TABLE "new_offers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offerNumber" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "categorySpecificData" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionCount" INTEGER NOT NULL DEFAULT 0,
    "lastRejectedAt" DATETIME,
    "canOfferAgainAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "offers_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "offers_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "offers_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_offers" ("buyerId", "canOfferAgainAt", "categorySpecificData", "createdAt", "description", "expiresAt", "id", "lastRejectedAt", "listingId", "offerNumber", "price", "rejectionCount", "sellerId", "status", "updatedAt") SELECT "buyerId", "canOfferAgainAt", "categorySpecificData", "createdAt", "description", "expiresAt", "id", "lastRejectedAt", "listingId", "offerNumber", "price", "rejectionCount", "sellerId", "status", "updatedAt" FROM "offers";
DROP TABLE "offers";
ALTER TABLE "new_offers" RENAME TO "offers";
CREATE UNIQUE INDEX "offers_offerNumber_key" ON "offers"("offerNumber");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "passwordResetToken" TEXT,
    "passwordResetExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatar", "createdAt", "email", "firstName", "id", "isActive", "lastName", "password", "passwordResetExpiresAt", "passwordResetToken", "phone", "updatedAt") SELECT "avatar", "createdAt", "email", "firstName", "id", "isActive", "lastName", "password", "passwordResetExpiresAt", "passwordResetToken", "phone", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
