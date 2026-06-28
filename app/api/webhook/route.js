import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return Response.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const customerId = session.customer;

    let plan = "pro";
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;
      if (priceId === process.env.STRIPE_PRICE_BUSINESS) {
        plan = "business";
      }
    } catch (e) {
      // default to pro if lookup fails
    }

    if (userId) {
      await supabaseAdmin
        .from("profiles")
        .upsert({ id: userId, subscription_status: plan, stripe_customer_id: customerId });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    await supabaseAdmin
      .from("profiles")
      .update({ subscription_status: "free" })
      .eq("stripe_customer_id", customerId);
  }

  return Response.json({ received: true });
}
