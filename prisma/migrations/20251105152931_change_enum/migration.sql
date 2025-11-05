/*
  Warnings:

  - The values [ALTA,MEDIA,BAIXA] on the enum `Criticidade` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUCESSO,FALHA] on the enum `Resultado` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Criticidade_new" AS ENUM ('HIGH', 'MEDIUM', 'LOW');
ALTER TABLE "eaud_evento_auditoria" ALTER COLUMN "eaud_criticidade" TYPE "Criticidade_new" USING ("eaud_criticidade"::text::"Criticidade_new");
ALTER TYPE "Criticidade" RENAME TO "Criticidade_old";
ALTER TYPE "Criticidade_new" RENAME TO "Criticidade";
DROP TYPE "public"."Criticidade_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Resultado_new" AS ENUM ('SUCCESS', 'FAILURE');
ALTER TABLE "eaud_evento_auditoria" ALTER COLUMN "eaud_resultado" TYPE "Resultado_new" USING ("eaud_resultado"::text::"Resultado_new");
ALTER TYPE "Resultado" RENAME TO "Resultado_old";
ALTER TYPE "Resultado_new" RENAME TO "Resultado";
DROP TYPE "public"."Resultado_old";
COMMIT;
