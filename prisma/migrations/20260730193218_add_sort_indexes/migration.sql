-- CreateIndex
CREATE INDEX "Task_updatedAt_id_idx" ON "Task"("updatedAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Task_description_id_idx" ON "Task"("description", "id");
