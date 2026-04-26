import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentRequest {
  amount: number;
  currency: string;
  bookingId: string;
  paymentMethod: "razorpay" | "stripe";
  email: string;
  phone: string;
  description: string;
}

interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

interface StripePaymentIntentResponse {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_received: number;
  currency: string;
  status: string;
  client_secret: string;
}

async function createRazorpayOrder(
  amount: number,
  currency: string,
  receipt: string
): Promise<RazorpayOrderResponse> {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

  if (!keyId || !keySecret) {
    throw new Error("Missing Razorpay credentials");
  }

  const auth = btoa(`${keyId}:${keySecret}`);

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: currency,
      receipt: receipt,
      payment_capture: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Razorpay error: ${response.statusText}`);
  }

  return await response.json();
}

async function createStripePaymentIntent(
  amount: number,
  currency: string,
  description: string,
  email: string
): Promise<StripePaymentIntentResponse> {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!secretKey) {
    throw new Error("Missing Stripe API key");
  }

  const params = new URLSearchParams({
    amount: Math.round(amount * 100).toString(),
    currency: currency,
    description: description,
    receipt_email: email,
  });

  const response = await fetch(
    "https://api.stripe.com/v1/payment_intents",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  if (!response.ok) {
    throw new Error(`Stripe error: ${response.statusText}`);
  }

  return await response.json();
}

async function storePaymentRecord(
  supabaseClient: any,
  userId: string,
  bookingId: string,
  paymentId: string,
  amount: number,
  paymentMethod: string,
  status: string
) {
  const { error } = await supabaseClient
    .from("payment_records")
    .insert({
      user_id: userId,
      booking_id: bookingId,
      payment_id: paymentId,
      amount: amount,
      payment_method: paymentMethod,
      status: status,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error storing payment record:", error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      amount,
      currency,
      bookingId,
      paymentMethod,
      email,
      phone,
      description,
    } = await req.json() as PaymentRequest;

    if (!amount || !currency || !bookingId || !paymentMethod) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let result;

    if (paymentMethod === "razorpay") {
      const order = await createRazorpayOrder(
        amount,
        currency,
        bookingId
      );

      await storePaymentRecord(
        supabase,
        user.id,
        bookingId,
        order.id,
        amount,
        "razorpay",
        "pending"
      );

      result = {
        paymentId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        provider: "razorpay",
      };
    } else if (paymentMethod === "stripe") {
      const intent = await createStripePaymentIntent(
        amount,
        currency,
        description,
        email
      );

      await storePaymentRecord(
        supabase,
        user.id,
        bookingId,
        intent.id,
        amount,
        "stripe",
        "requires_payment_method"
      );

      result = {
        paymentId: intent.id,
        clientSecret: intent.client_secret,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        provider: "stripe",
      };
    } else {
      throw new Error("Unsupported payment method");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
