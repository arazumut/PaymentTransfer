-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_qr_code_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "amount" REAL,
    "description" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'standard',
    "recurringInterval" TEXT,
    "maxUsageCount" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qr_code_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_qr_code_tokens" ("amount", "createdAt", "description", "expiresAt", "id", "userId") SELECT "amount", "createdAt", "description", "expiresAt", "id", "userId" FROM "qr_code_tokens";
DROP TABLE "qr_code_tokens";
ALTER TABLE "new_qr_code_tokens" RENAME TO "qr_code_tokens";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
