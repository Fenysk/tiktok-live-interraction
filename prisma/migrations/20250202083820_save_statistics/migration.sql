/*
  Warnings:

  - You are about to drop the `Answer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_optionId_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionId_fkey";

-- DropTable
DROP TABLE "Answer";

-- CreateTable
CREATE TABLE "User" (
    "uniqueId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "profilePictureUrl" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uniqueId")
);

-- CreateTable
CREATE TABLE "Statistic" (
    "userId" TEXT NOT NULL,
    "lastParticipation" TIMESTAMP(3),
    "participationCount" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "comboMax" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Statistic_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "Statistic" ADD CONSTRAINT "Statistic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uniqueId") ON DELETE CASCADE ON UPDATE CASCADE;
