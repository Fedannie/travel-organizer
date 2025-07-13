-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PackingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packingListId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "packed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "PackingItem_packingListId_fkey" FOREIGN KEY ("packingListId") REFERENCES "PackingList" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PackingItem" ("id", "packingListId", "name", "category", "quantity", "packed", "notes") SELECT "id", "packingListId", "name", "category", "quantity", "packed", "notes" FROM "PackingItem";
DROP TABLE "PackingItem";
ALTER TABLE "new_PackingItem" RENAME TO "PackingItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;