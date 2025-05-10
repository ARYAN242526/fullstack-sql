-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordResetExpiry" DROP NOT NULL,
ALTER COLUMN "passwordResetExpiry" SET DATA TYPE TEXT;
