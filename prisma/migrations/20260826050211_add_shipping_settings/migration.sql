-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "storeName" TEXT NOT NULL,
    "businessAddress" TEXT NOT NULL,
    "storePhone" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "shippingProvider" TEXT NOT NULL,
    "defaultPackage" TEXT NOT NULL,
    "notificationFrequency" TEXT NOT NULL,
    "notifications" JSONB NOT NULL,
    "autoFulfillment" BOOLEAN NOT NULL DEFAULT false,
    "insurance" BOOLEAN NOT NULL DEFAULT false,
    "signatureRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
