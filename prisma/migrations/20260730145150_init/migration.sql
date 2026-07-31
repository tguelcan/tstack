-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_createdAt_id_idx" ON "Task"("createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Task_done_createdAt_idx" ON "Task"("done", "createdAt" DESC);
