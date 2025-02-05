/*
  Warnings:

  - You are about to drop the column `correctOptionId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `Option` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `difficulty` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionText` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- -- CreateEnum
-- CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- -- DropForeignKey
-- ALTER TABLE "Option" DROP CONSTRAINT "Option_questionId_fkey";

-- -- AlterTable
-- ALTER TABLE "Question" DROP COLUMN "correctOptionId",
-- DROP COLUMN "text",
-- ADD COLUMN     "correctOptions" TEXT[],
-- ADD COLUMN     "difficulty" "Difficulty" NOT NULL,
-- ADD COLUMN     "explanation" TEXT,
-- ADD COLUMN     "fieldsToComplete" TEXT[],
-- ADD COLUMN     "mediasPath" TEXT[],
-- ADD COLUMN     "questionText" TEXT NOT NULL,
-- ADD COLUMN     "wrongOptions" TEXT[];

-- -- DropTable
-- DROP TABLE "Option";

/*
  Remplacement :
  Ce fichier de migration transforme le schéma de la base de données tout en préservant les données existantes.
*/

-- Création de l'énumération Difficulty
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- Ajout des colonnes temporaires pour stocker les nouvelles valeurs
ALTER TABLE "Question"
ADD COLUMN "correctOptions" TEXT[] DEFAULT '{}',
ADD COLUMN "wrongOptions" TEXT[] DEFAULT '{}',
ADD COLUMN "difficulty" "Difficulty" DEFAULT 'MEDIUM',
ADD COLUMN "explanation" TEXT DEFAULT NULL,
ADD COLUMN "fieldsToComplete" TEXT[] DEFAULT '{}',
ADD COLUMN "mediasPath" TEXT[] DEFAULT '{}',
ADD COLUMN "questionText" TEXT DEFAULT NULL;

-- Mise à jour des colonnes temporaires avec les valeurs existantes
UPDATE "Question"
SET "questionText" = "text";

UPDATE "Question"
SET "correctOptions" = ARRAY(
  SELECT "text"
  FROM "Option"
  WHERE "Option"."questionId" = "Question"."id"
  AND "Option"."id" = "Question"."correctOptionId"
);

UPDATE "Question"
SET "wrongOptions" = ARRAY(
  SELECT "text"
  FROM "Option"
  WHERE "Option"."questionId" = "Question"."id"
  AND "Option"."id" != "Question"."correctOptionId"
);

-- Suppression des anciennes colonnes
ALTER TABLE "Question"
DROP COLUMN "correctOptionId",
DROP COLUMN "text";

-- Suppression de la table Option
DROP TABLE "Option";

-- Mise à jour des colonnes pour les rendre non nullables
ALTER TABLE "Question"
ALTER COLUMN "questionText" SET NOT NULL,
ALTER COLUMN "difficulty" SET NOT NULL;
