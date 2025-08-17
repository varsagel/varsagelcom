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
    "price" REAL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_Listing" ("budgetMax", "budgetMin", "category", "categorySpecificData", "createdAt", "description", "district", "expiresAt", "favoriteCount", "icon", "id", "images", "likeCount", "location", "mileageMax", "mileageMin", "status", "subcategory", "title", "updatedAt", "userId", "videoUrl", "viewCount") SELECT "budgetMax", "budgetMin", "category", "categorySpecificData", "createdAt", "description", "district", "expiresAt", "favoriteCount", "icon", "id", "images", "likeCount", "location", "mileageMax", "mileageMin", "status", "subcategory", "title", "updatedAt", "userId", "videoUrl", "viewCount" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
