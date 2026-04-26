import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface HotelSearchRequest {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  radius?: number;
  radiusUnit?: string;
}

interface AmadeusTokenResponse {
  access_token: string;
  expires_in: number;
}

async function getAmadeusToken(): Promise<string> {
  const clientId = Deno.env.get("AMADEUS_CLIENT_ID");
  const clientSecret = Deno.env.get("AMADEUS_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Missing Amadeus credentials");
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Amadeus auth failed: ${response.statusText}`);
  }

  const data: AmadeusTokenResponse = await response.json();
  return data.access_token;
}

async function searchHotels(request: HotelSearchRequest, token: string) {
  const params = new URLSearchParams({
    cityCode: request.cityCode,
    checkInDate: request.checkInDate,
    checkOutDate: request.checkOutDate,
    adults: request.adults.toString(),
    radius: (request.radius || 5).toString(),
    radiusUnit: request.radiusUnit || "KM",
  });

  const response = await fetch(
    `https://test.api.amadeus.com/v3/shopping/hotel-offers?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error(`Hotel search error: ${response.statusText}`);
    throw new Error(`Hotel search failed: ${response.statusText}`);
  }

  return await response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { cityCode, checkInDate, checkOutDate, adults, radius, radiusUnit } =
      await req.json() as HotelSearchRequest;

    if (!cityCode || !checkInDate || !checkOutDate || !adults) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = await getAmadeusToken();
    const hotels = await searchHotels(
      {
        cityCode,
        checkInDate,
        checkOutDate,
        adults,
        radius,
        radiusUnit,
      },
      token
    );

    return new Response(JSON.stringify(hotels), {
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
