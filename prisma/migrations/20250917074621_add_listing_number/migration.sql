/*
  Warnings:

  - Added the required column `listingNumber` to the `listings` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "location" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subCategoryId" TEXT NOT NULL,
    "categorySpecificData" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "views" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Mevcut kayıtlar için ilan numarası oluştur (10000'den başlayarak)
INSERT INTO "new_listings" ("categoryId", "categorySpecificData", "createdAt", "description", "id", "images", "location", "price", "status", "subCategoryId", "title", "updatedAt", "userId", "views", "listingNumber") 
SELECT "categoryId", "categorySpecificData", "createdAt", "description", "id", "images", "location", "price", "status", "subCategoryId", "title", "updatedAt", "userId", "views", 
       CAST((10000 + ROW_NUMBER() OVER (ORDER BY "createdAt") - 1) AS TEXT) as "listingNumber"
FROM "listings";
DROP TABLE "listings";
ALTER TABLE "new_listings" RENAME TO "listings";
CREATE UNIQUE INDEX "listings_listingNumber_key" ON "listings"("listingNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
