-- AlterTable: link secretary to their assigned doctor
ALTER TABLE "User" ADD COLUMN "linkedDoctorId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_linkedDoctorId_fkey"
    FOREIGN KEY ("linkedDoctorId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
