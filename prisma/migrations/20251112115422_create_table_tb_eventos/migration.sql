-- CreateEnum
CREATE TYPE "Criticidade" AS ENUM ('ALTA', 'MEDIA', 'BAIXA');

-- CreateEnum
CREATE TYPE "Resultado" AS ENUM ('SUCESSO', 'FALHA');

-- CreateTable
CREATE TABLE "tb_eventos_auditoria" (
    "id_evento" SERIAL NOT NULL,
    "ts_data_ocorreu" TIMESTAMP(3) NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "tipo_evento" TEXT NOT NULL,
    "ip_origem" TEXT NOT NULL,
    "st_criticidade" "Criticidade" NOT NULL,
    "st_resultado" "Resultado" NOT NULL,
    "id_correlacao" TEXT,
    "id_entidade" TEXT,
    "detalhes_json" JSONB,
    "ts_data_cadastro" TIMESTAMP(3) NOT NULL,
    "usuario_adicionou" TEXT NOT NULL,
    "usuario_alterou" TEXT NOT NULL,

    CONSTRAINT "tb_eventos_auditoria_pkey" PRIMARY KEY ("id_evento")
);
