-- CreateTable: PM Data
CREATE TABLE IF NOT EXISTS "pm_data" (
    "id" SERIAL PRIMARY KEY,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: O3 Data
CREATE TABLE IF NOT EXISTS "o3_data" (
    "id" SERIAL PRIMARY KEY,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: NO2 Data
CREATE TABLE IF NOT EXISTS "no2_data" (
    "id" SERIAL PRIMARY KEY,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_pm_location" ON "pm_data"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "idx_pm_created" ON "pm_data"("createdAt");

CREATE INDEX IF NOT EXISTS "idx_o3_location" ON "o3_data"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "idx_o3_created" ON "o3_data"("createdAt");

CREATE INDEX IF NOT EXISTS "idx_no2_location" ON "no2_data"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "idx_no2_created" ON "no2_data"("createdAt");
