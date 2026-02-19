/*
  Warnings:

  - You are about to drop the column `id_criticidade` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `id_resultado` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - Added the required column `id_result` to the `tb_eventos_auditoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_severity` to the `tb_eventos_auditoria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tb_eventos_auditoria" DROP COLUMN "id_criticidade",
DROP COLUMN "id_resultado",
ADD COLUMN     "id_result" "Result" NOT NULL,
ADD COLUMN     "id_severity" "Severity" NOT NULL;
