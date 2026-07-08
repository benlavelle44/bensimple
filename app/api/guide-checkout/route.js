import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Credit packs, defined here so pricing lives in code, not scattered across
// the Stripe dashboard. Update prices in Stripe, then update the amounts below.
const PACKS = {
  single: { credits: 1, amount: 700, label: "1 Guide Credit" },      // $7
  five: { credits: 5, amount: 3000, label: "5 Guide Credits" },      // $30 ($6/each)
};

export async function POST(req) {
  try {
    const { userId, userEmail, pack } = await req.json();
    const selected = PACKS[pack] || PACKS.single;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: selected.label },
            unit_amount: selected.amount,
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: { userId, credits: String(selected.credits) },
      success_url: "https://bensimple.co/guide?purchased=true",
      cancel_url: "https://bensimple.co/guide",
    });

    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
