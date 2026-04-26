import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PlacesRequest {
  input?: string;
  location?: { lat: number; lng: number };
  radius?: number;
  types?: string[];
}

async function getPlacesPredictions(input: string) {
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) {
    throw new Error("Missing Google Maps API key");
  }

  const params = new URLSearchParams({
    input: input,
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
  );

  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.predictions || [];
}

async function getNearbyPlaces(
  lat: number,
  lng: number,
  radius: number,
  types?: string[]
) {
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) {
    throw new Error("Missing Google Maps API key");
  }

  const typeFilter = types && types.length > 0 ? types.join("|") : "tourist_attraction";

  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: radius.toString(),
    type: typeFilter,
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`
  );

  if (!response.ok) {
    throw new Error(`Google Places nearby search error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
}

async function getPlaceDetails(placeId: string) {
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) {
    throw new Error("Missing Google Maps API key");
  }

  const params = new URLSearchParams({
    place_id: placeId,
    fields:
      "name,formatted_address,geometry,rating,photos,types,website,phone_number,opening_hours",
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  );

  if (!response.ok) {
    throw new Error(`Google Places details error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result || null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { input, location, radius, types, action, placeId } =
      await req.json() as PlacesRequest & {
        action: "autocomplete" | "nearby" | "details";
        placeId?: string;
      };

    let result;

    if (action === "autocomplete" && input) {
      result = await getPlacesPredictions(input);
    } else if (action === "nearby" && location) {
      result = await getNearbyPlaces(
        location.lat,
        location.lng,
        radius || 5000,
        types
      );
    } else if (action === "details" && placeId) {
      result = await getPlaceDetails(placeId);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action or missing parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
