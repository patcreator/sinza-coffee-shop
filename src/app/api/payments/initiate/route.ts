import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * MoMo + Airtel go through PawaPay, cards through Pesapal.
 * When provider credentials are missing we create a sandbox intent so the
 * whole checkout flow stays testable end to end.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = String(body.code || "");
  const method = String(body.method || "momo"); // momo | airtel | card
  const phone = String(body.phone || "");

  const found = await db.select().from(orders).where(eq(orders.code, code)).limit(1);
  if (!found.length) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const order = found[0];
  if (order.paymentStatus === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 });

  const provider = method === "card" ? "pesapal" : "pawapay";
  const reference = `${order.code}-${Date.now().toString(36).toUpperCase()}`;
  let redirectUrl: string | null = null;
  let status = "pending";
  let message = "";

  try {
    if (provider === "pawapay" && process.env.PAWAPAY_API_TOKEN) {
      const res = await fetch(
        `${process.env.PAWAPAY_BASE_URL || "https://api.sandbox.pawapay.io"}/deposits`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PAWAPAY_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            depositId: crypto.randomUUID(),
            amount: String(order.total),
            currency: "RWF",
            correspondent: method === "airtel" ? "AIRTEL_RWA" : "MTN_MOMO_RWA",
            payer: { type: "MSISDN", address: { value: phone.replace(/\D/g, "") } },
            customerTimestamp: new Date().toISOString(),
            statementDescription: "Sinza Coffee",
          }),
        },
      );
      const json = await res.json().catch(() => ({}));
      status = res.ok ? "pending" : "failed";
      message = res.ok
        ? "Approve the payment prompt on your phone."
        : (json?.errorMessage as string) || "PawaPay rejected the request.";
    } else if (provider === "pesapal" && process.env.PESAPAL_CONSUMER_KEY) {
      const authRes = await fetch(
        `${process.env.PESAPAL_BASE_URL || "https://cybqa.pesapal.com/pesapalv3"}/api/Auth/RequestToken`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            consumer_key: process.env.PESAPAL_CONSUMER_KEY,
            consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
          }),
        },
      );
      const auth = await authRes.json().catch(() => ({}));
      if (auth?.token) {
        const orderRes = await fetch(
          `${process.env.PESAPAL_BASE_URL || "https://cybqa.pesapal.com/pesapalv3"}/api/Transactions/SubmitOrderRequest`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${auth.token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              id: reference,
              currency: "RWF",
              amount: order.total,
              description: `Sinza order ${order.code}`,
              callback_url: `${SITE_URL}/order/${order.code}`,
              notification_id: process.env.PESAPAL_IPN_ID || "",
              billing_address: { email_address: order.customerEmail || "guest@sinzacoffeeshop.rw" },
            }),
          },
        );
        const orderJson = await orderRes.json().catch(() => ({}));
        redirectUrl = orderJson?.redirect_url ?? null;
        message = redirectUrl ? "Continue on the secure Pesapal page." : "Pesapal did not return a redirect URL.";
      } else {
        status = "failed";
        message = "Could not authenticate with Pesapal.";
      }
    } else {
      message =
        "Sandbox mode: provider keys are not configured, so this payment intent was created locally for testing.";
      redirectUrl = `${SITE_URL}/order/${order.code}?sandbox=1&ref=${reference}`;
    }
  } catch (err) {
    status = "failed";
    message = err instanceof Error ? err.message : "Payment provider error";
  }

  const [payment] = await db
    .insert(payments)
    .values({
      orderId: order.id,
      provider,
      method,
      amount: order.total,
      status,
      reference,
      payload: { phone, message },
    })
    .returning();

  await db
    .update(orders)
    .set({ paymentMethod: method, paymentRef: reference, paymentStatus: status === "failed" ? "failed" : "pending" })
    .where(eq(orders.id, order.id));

  return NextResponse.json({ payment, redirectUrl, message, status });
}
