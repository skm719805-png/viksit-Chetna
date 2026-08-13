import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount } = await req.json();
  if (!amount || amount < 1) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${key_id}:${key_secret}`).toString("base64") },
    body: JSON.stringify({ amount: amount * 100, currency: "INR", receipt: `donation_${Date.now()}` }),
  });
  const order = await res.json();
  if (order.error) return NextResponse.json({ error: order.error.description }, { status: 500 });
  return NextResponse.json({ orderId: order.id, key: key_id });
}
