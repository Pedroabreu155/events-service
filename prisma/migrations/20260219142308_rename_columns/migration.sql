/*
  Warnings:

  - The primary key for the `tb_eventos_auditoria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `detalhes_json` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `id_cliente` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `id_correlacao` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `id_entidade` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `id_evento` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `ip_origem` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `st_criticidade` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `st_resultado` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_evento` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `ts_data_cadastro` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `ts_data_ocorreu` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_adicionou` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_alterou` on the `tb_eventos_auditoria` table. All the data in the column will be lost.
  - Added the required column `id_company` to the `tb_eventos_auditoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_created_by` to the `tb_eventos_auditoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_criticidade` to the `tb_eventos_auditoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_resultado` to the `tb_eventos_auditoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_updated_by` to the `tb_eventos_auditoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_user` to the `tb_eventos_auditoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip_host` to the `tb_eventos_auditoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tp_event` to the `tb_eventos_auditoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ts_created_at` to the `tb_eventos_auditoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ts_transaction` to the `tb_eventos_auditoria` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "Result" AS ENUM ('SUCCESS', 'FAILURE');

-- AlterTable
ALTER TABLE "tb_eventos_auditoria" DROP CONSTRAINT "tb_eventos_auditoria_pkey",
DROP COLUMN "detalhes_json",
DROP COLUMN "id_cliente",
DROP COLUMN "id_correlacao",
DROP COLUMN "id_entidade",
DROP COLUMN "id_evento",
DROP COLUMN "id_usuario",
DROP COLUMN "ip_origem",
DROP COLUMN "st_criticidade",
DROP COLUMN "st_resultado",
DROP COLUMN "tipo_evento",
DROP COLUMN "ts_data_cadastro",
DROP COLUMN "ts_data_ocorreu",
DROP COLUMN "usuario_adicionou",
DROP COLUMN "usuario_alterou",
ADD COLUMN     "id_company" INTEGER NOT NULL,
ADD COLUMN     "id_correlation" TEXT,
ADD COLUMN     "id_created_by" TEXT NOT NULL,
ADD COLUMN     "id_criticidade" "Severity" NOT NULL,
ADD COLUMN     "id_entity" TEXT,
ADD COLUMN     "id_event" SERIAL NOT NULL,
ADD COLUMN     "id_resultado" "Result" NOT NULL,
ADD COLUMN     "id_updated_by" TEXT NOT NULL,
ADD COLUMN     "id_user" INTEGER NOT NULL,
ADD COLUMN     "ip_host" TEXT NOT NULL,
ADD COLUMN     "js_detail" JSONB,
ADD COLUMN     "tp_event" TEXT NOT NULL,
ADD COLUMN     "ts_created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ts_transaction" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "tb_eventos_auditoria_pkey" PRIMARY KEY ("id_event");

-- DropEnum
DROP TYPE "public"."Criticidade";

-- DropEnum
DROP TYPE "public"."Resultado";

-- CreateIndex
CREATE INDEX "tb_eventos_auditoria_id_company_ts_transaction_idx" ON "tb_eventos_auditoria"("id_company", "ts_transaction");

-- CreateIndex
CREATE INDEX "tb_eventos_auditoria_id_user_ts_transaction_idx" ON "tb_eventos_auditoria"("id_user", "ts_transaction");

-- CreateIndex
CREATE INDEX "tb_eventos_auditoria_tp_event_ts_transaction_idx" ON "tb_eventos_auditoria"("tp_event", "ts_transaction");
