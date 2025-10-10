/*
  Warnings:

  - Changed the type of `eaud_user_pess_oras_codigo` on the `eaud_evento_auditoria` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `eaud_client_pess_oras_codigo` on the `eaud_evento_auditoria` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "eaud_evento_auditoria" DROP COLUMN "eaud_user_pess_oras_codigo",
ADD COLUMN     "eaud_user_pess_oras_codigo" INTEGER NOT NULL,
DROP COLUMN "eaud_client_pess_oras_codigo",
ADD COLUMN     "eaud_client_pess_oras_codigo" INTEGER NOT NULL;
