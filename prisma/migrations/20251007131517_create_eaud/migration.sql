-- CreateEnum
CREATE TYPE "Criticidade" AS ENUM ('ALTA', 'MEDIA', 'BAIXA');

-- CreateEnum
CREATE TYPE "Resultado" AS ENUM ('SUCESSO', 'FALHA');

-- CreateTable
CREATE TABLE "eaud_evento_auditoria" (
    "eaud_codigo" SERIAL NOT NULL,
    "eaud_timestamp" TIMESTAMP(3) NOT NULL,
    "eaud_user_pess_oras_codigo" TEXT NOT NULL,
    "eaud_client_pess_oras_codigo" TEXT NOT NULL,
    "eaud_tipo_evento" TEXT NOT NULL,
    "eaud_ip_origem" TEXT NOT NULL,
    "eaud_criticidade" "Criticidade" NOT NULL,
    "eaud_resultado" "Resultado" NOT NULL,
    "eaud_id_correlacao" TEXT,
    "eaud_id_entidade" TEXT,
    "eaud_detalhes_json" JSONB,
    "eaud_data_cadastro" TIMESTAMP(3) NOT NULL,
    "eaud_usuario_adicionou" TEXT NOT NULL,
    "eaud_usuario_alterou" TEXT NOT NULL,

    CONSTRAINT "eaud_evento_auditoria_pkey" PRIMARY KEY ("eaud_codigo")
);
