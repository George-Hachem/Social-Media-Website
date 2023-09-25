/*
  Warnings:

  - The primary key for the `ExampleUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ExampleUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `ExampleUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `ExampleUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followeeId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userId_fkey";

-- AlterTable
ALTER TABLE "ExampleUser" DROP CONSTRAINT "ExampleUser_pkey",
DROP COLUMN "id",
ADD COLUMN     "username" TEXT NOT NULL,
ADD CONSTRAINT "ExampleUser_pkey" PRIMARY KEY ("username");

-- AlterTable
ALTER TABLE "Follow" ALTER COLUMN "followerId" SET DATA TYPE TEXT,
ALTER COLUMN "followeeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ExampleUser_username_key" ON "ExampleUser"("username");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ExampleUser"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "ExampleUser"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followeeId_fkey" FOREIGN KEY ("followeeId") REFERENCES "ExampleUser"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
