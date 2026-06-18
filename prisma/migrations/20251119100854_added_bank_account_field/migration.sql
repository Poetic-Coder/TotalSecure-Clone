-- AlterTable
ALTER TABLE "wallet_transactions" ADD COLUMN     "bank_account_id" UUID,
ADD COLUMN     "bank_account_pk" INTEGER;

-- CreateTable
CREATE TABLE "bank_accounts" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "agentPk" INTEGER,
    "agentId" UUID,
    "customerPk" INTEGER,
    "customerId" UUID,
    "account_number" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_id_key" ON "bank_accounts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_customerPk_customerId_key" ON "bank_accounts"("customerPk", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_agentPk_agentId_key" ON "bank_accounts"("agentPk", "agentId");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_pk_id_key" ON "bank_accounts"("pk", "id");

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_agentPk_agentId_fkey" FOREIGN KEY ("agentPk", "agentId") REFERENCES "agents"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_customerPk_customerId_fkey" FOREIGN KEY ("customerPk", "customerId") REFERENCES "customers"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_bank_account_pk_bank_account_id_fkey" FOREIGN KEY ("bank_account_pk", "bank_account_id") REFERENCES "bank_accounts"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;
