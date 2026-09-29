/*
  Warnings:

  - You are about to drop the column `balanceUsed` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IotDevice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_customerId_fkey`;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `balanceUsed`,
    DROP COLUMN `customerId`;

-- DropTable
DROP TABLE `Customer`;

-- DropTable
DROP TABLE `IotDevice`;
