import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { repairRequests } from "@/lib/db/schema";
import { createNotification } from "@/lib/db/queries/notifications";
import { logger } from "@/lib/logger";

interface CourierWebhookPayload {
  barcode: string;
  status: string;
  description?: string;
  location?: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.COURIER_WEBHOOK_SECRET;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: CourierWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { barcode, status, description } = payload;

  if (!barcode || !status) {
    return NextResponse.json({ error: "Missing barcode or status" }, { status: 400 });
  }

  try {
    const repair = await db.query.repairRequests.findFirst({
      where: eq(repairRequests.returnTracking, barcode),
      columns: { id: true, customerId: true, currentStatus: true },
    });

    if (!repair) {
      logger.info("No repair found for tracking barcode", { barcode });
      return NextResponse.json({ received: true });
    }

    if (status === "delivered" && repair.currentStatus === "shipped") {
      await db
        .update(repairRequests)
        .set({ currentStatus: "delivered" })
        .where(eq(repairRequests.id, repair.id));

      await createNotification({
        userId: repair.customerId,
        type: "status_update",
        title: "Jersey Delivered",
        message: "Your jersey has been delivered. Thank you for choosing KitFix!",
        repairRequestId: repair.id,
      });
    }

    if (status === "in_transit") {
      await createNotification({
        userId: repair.customerId,
        type: "status_update",
        title: "Jersey In Transit",
        message: description ?? "Your jersey is on its way back to you!",
        repairRequestId: repair.id,
      });
    }
  } catch (error) {
    logger.error("Failed to process courier webhook", { error, barcode });
  }

  return NextResponse.json({ received: true });
}
