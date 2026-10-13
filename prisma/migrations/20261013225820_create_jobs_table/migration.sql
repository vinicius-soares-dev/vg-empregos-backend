-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "salario" DOUBLE PRECISION NOT NULL,
    "localizacao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "empresaId" INTEGER NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
