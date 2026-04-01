-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "Result" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateTable
CREATE TABLE "tb_eventos_auditoria" (
    "id_event" SERIAL NOT NULL,
    "ts_transaction" TIMESTAMP(3) NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_company" INTEGER NOT NULL,
    "tp_event" TEXT NOT NULL,
    "ip_host" TEXT NOT NULL,
    "id_severity" "Severity" NOT NULL,
    "id_result" "Result" NOT NULL,
    "id_correlation" TEXT,
    "id_entity" TEXT,
    "js_detail" JSONB,
    "ts_created_at" TIMESTAMP(3) NOT NULL,
    "id_created_by" TEXT NOT NULL,
    "id_updated_by" TEXT NOT NULL,

    CONSTRAINT "tb_eventos_auditoria_pkey" PRIMARY KEY ("id_event")
);

-- CreateIndex
CREATE INDEX "tb_eventos_auditoria_id_company_ts_transaction_idx" ON "tb_eventos_auditoria"("id_company", "ts_transaction");

-- CreateIndex
CREATE INDEX "tb_eventos_auditoria_id_user_ts_transaction_idx" ON "tb_eventos_auditoria"("id_user", "ts_transaction");

-- CreateIndex
CREATE INDEX "tb_eventos_auditoria_tp_event_ts_transaction_idx" ON "tb_eventos_auditoria"("tp_event", "ts_transaction");
