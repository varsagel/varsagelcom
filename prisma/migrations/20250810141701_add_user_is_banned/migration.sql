-- CreateTable
CREATE TABLE "ListingView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "listingId" TEXT NOT NULL,
    CONSTRAINT "ListingView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ListingView_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "location" TEXT NOT NULL,
    "district" TEXT,
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
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "categorySpecificData" JSONB,
    "mileageMin" INTEGER,
    "mileageMax" INTEGER,
    "icon" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("budgetMax", "budgetMin", "category", "categorySpecificData", "createdAt", "description", "district", "expiresAt", "favoriteCount", "id", "images", "likeCount", "location", "mileageMax", "mileageMin", "status", "subcategory", "title", "updatedAt", "userId", "videoUrl") SELECT "budgetMax", "budgetMin", "category", "categorySpecificData", "createdAt", "description", "district", "expiresAt", "favoriteCount", "id", "images", "likeCount", "location", "mileageMax", "mileageMin", "status", "subcategory", "title", "updatedAt", "userId", "videoUrl" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileImage" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("createdAt", "email", "id", "location", "name", "password", "phone", "profileImage", "rating", "reviewCount", "updatedAt") SELECT "createdAt", "email", "id", "location", "name", "password", "phone", "profileImage", "rating", "reviewCount", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ListingView_userId_listingId_key" ON "ListingView"("userId", "listingId");
