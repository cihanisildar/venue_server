// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User-related models
model User {
  id             String           @id @default(cuid())
  email          String           @unique
  username       String           @unique
  age            Int?
  name           String
  phoneNumber    String?
  preferences    UserPreference[]
  reviews        Review[]
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}

model UserPreference {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  budget        Float
  petsAllowed   Boolean   @default(false)
  quiet         Boolean   @default(false)
  outdoor       Boolean   @default(false)
  wifi          Boolean   @default(false)
  parking       Boolean   @default(false)
  accessibility Boolean   @default(false)
  studyPlace    Boolean   @default(false)
  noiseLevel    NoisePreference? @default(MODERATE)
  preferredTime TimePreference?  @default(ANY)
  groupSize     Int
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Venue-related models
model Venue {
  id           String         @id @default(cuid())
  name         String
  type         VenueType
  description  String?
  address      String
  location     Location?
  menuItems    MenuItem[]
  features     VenueFeature[]
  openingHours OpeningHour[]
  reviews      Review[]
  images       VenueImage[]
  avgPrice     Float
  rating       Float         @default(0)
  isActive     Boolean       @default(true)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Location {
  id        String   @id @default(cuid())
  venueId   String   @unique
  venue     Venue    @relation(fields: [venueId], references: [id])
  latitude  Float
  longitude Float
  city      String
  district  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model MenuItem {
  id          String   @id @default(cuid())
  venueId     String
  venue       Venue    @relation(fields: [venueId], references: [id])
  name        String
  description String?
  price       Float
  category    String
  isAvailable Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model VenueFeature {
  id          String   @id @default(cuid())
  venueId     String
  venue       Venue    @relation(fields: [venueId], references: [id])
  petsAllowed Boolean  @default(false)
  quiet       Boolean  @default(false)
  outdoor     Boolean  @default(false)
  wifi        Boolean  @default(false)
  parking     Boolean  @default(false)
  accessibility Boolean @default(false)
  maxGroupSize Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model OpeningHour {
  id        String   @id @default(cuid())
  venueId   String
  venue     Venue    @relation(fields: [venueId], references: [id])
  dayOfWeek Int      // 0-6 (Sunday-Saturday)
  openTime  String
  closeTime String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VenueImage {
  id        String   @id @default(cuid())
  venueId   String
  venue     Venue    @relation(fields: [venueId], references: [id])
  url       String
  caption   String?
  isMain    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  venueId   String
  venue     Venue    @relation(fields: [venueId], references: [id])
  rating    Int
  comment   String?
  images    String[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Enums
enum VenueType {
  CAFE
  RESTAURANT
  HISTORICAL_PLACE
  MUSEUM
  PARK
  OTHER
}

enum TimePreference {
  EARLY_MORNING
  MORNING
  AFTERNOON
  EVENING
  NIGHT
  ANY
}

enum NoisePreference {
  SILENT
  QUIET
  MODERATE
  LIVELY
}