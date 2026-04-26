import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  adults: number;
  returnDate?: string;
}

export interface HotelSearchParams {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  radius?: number;
}

export interface PlacesRequest {
  action: 'autocomplete' | 'nearby' | 'details';
  input?: string;
  location?: { lat: number; lng: number };
  radius?: number;
  placeId?: string;
}

export interface PaymentParams {
  amount: number;
  currency: string;
  bookingId: string;
  paymentMethod: 'razorpay' | 'stripe';
  email: string;
  phone: string;
  description: string;
}

export interface BookingParams {
  tripId: string;
  bookingType: 'flight' | 'hotel' | 'activity';
  itemId: string;
  itemData: Record<string, any>;
  amount: number;
}

class APIClient {
  private async getAuthToken(): Promise<string> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return session.access_token;
  }

  private async callEdgeFunction<T>(
    functionName: string,
    payload: Record<string, any>
  ): Promise<T> {
    const token = await this.getAuthToken();

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  async searchFlights(params: FlightSearchParams) {
    return this.callEdgeFunction('search-flights', params);
  }

  async searchHotels(params: HotelSearchParams) {
    return this.callEdgeFunction('search-hotels', params);
  }

  async searchPlaces(params: PlacesRequest) {
    return this.callEdgeFunction('google-places', params);
  }

  async getPlaceAutocomplete(input: string) {
    return this.searchPlaces({
      action: 'autocomplete',
      input,
    });
  }

  async getNearbyPlaces(
    lat: number,
    lng: number,
    radius: number = 5000,
    types?: string[]
  ) {
    return this.searchPlaces({
      action: 'nearby',
      location: { lat, lng },
      radius,
      types,
    });
  }

  async getPlaceDetails(placeId: string) {
    return this.searchPlaces({
      action: 'details',
      placeId,
    });
  }

  async processPayment(params: PaymentParams) {
    return this.callEdgeFunction('process-payment', params);
  }

  async createBooking(params: BookingParams) {
    return this.callEdgeFunction('create-booking', params);
  }
}

export const apiClient = new APIClient();
