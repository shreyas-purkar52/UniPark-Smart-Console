-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slotId" TEXT NOT NULL,
    "levelId" INTEGER NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "vehicleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Slot_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("vehicleId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "studentType" TEXT,
    "photoUrl" TEXT,
    "vehicleType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "levelId" INTEGER NOT NULL,
    "entryTime" DATETIME NOT NULL,
    "exitTime" DATETIME,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Log_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("vehicleId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Slot_slotId_key" ON "Slot"("slotId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicleId_key" ON "Vehicle"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");
