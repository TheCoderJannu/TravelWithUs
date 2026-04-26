import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { apiClient } from '../../lib/api-client';
import { Hotel, Plane, MapPin, Star, Clock, CreditCard, AlertCircle } from 'lucide-react';

interface BookingInterfaceProps {
  destination?: string;
}

export function BookingInterface({ destination }: BookingInterfaceProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'hotels' | 'transport' | 'activities'>('hotels');
  const [hotels, setHotels] = useState<any[]>([]);
  const [transports, setTransports] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingItem, setBookingItem] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'stripe'>('razorpay');

  useEffect(() => {
    loadBookingOptions();
  }, [destination]);

  const loadBookingOptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const [hotelsData, transportsData, activitiesData] = await Promise.all([
        supabase.from('hotels').select('*').limit(8),
        supabase.from('transports').select('*').limit(8),
        supabase.from('activities').select('*').limit(8),
      ]);

      if (hotelsData.data) setHotels(hotelsData.data);
      if (transportsData.data) setTransports(transportsData.data);
      if (activitiesData.data) setActivities(activitiesData.data);
    } catch (err) {
      setError('Failed to load booking options');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user || !bookingItem) return;

    setPaymentLoading(true);
    setError(null);

    try {
      const paymentResult = await apiClient.processPayment({
        amount: bookingItem.price || bookingItem.price_per_night,
        currency: 'USD',
        bookingId: bookingItem.id,
        paymentMethod: paymentMethod,
        email: user.email || '',
        phone: '1234567890',
        description: `Booking for ${bookingItem.name || bookingItem.origin}`,
      });

      const bookingResult = await apiClient.createBooking({
        tripId: 'default-trip',
        bookingType: activeTab.slice(0, -1) as 'flight' | 'hotel' | 'activity',
        itemId: bookingItem.id,
        itemData: bookingItem,
        amount: bookingItem.price || bookingItem.price_per_night,
      });

      alert(`Booking successful! Payment ID: ${paymentResult.paymentId}`);
      setShowPayment(false);
      setBookingItem(null);
    } catch (err) {
      setError((err as Error).message || 'Booking failed. Please try again.');
      console.error(err);
    } finally {
      setPaymentLoading(false);
    }
  };

  const openPayment = (item: any) => {
    setBookingItem(item);
    setShowPayment(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Book Your Journey</h2>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('hotels')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition ${
              activeTab === 'hotels'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Hotel className="w-5 h-5" />
            <span>Hotels</span>
          </button>

          <button
            onClick={() => setActiveTab('transport')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition ${
              activeTab === 'transport'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Plane className="w-5 h-5" />
            <span>Transport</span>
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition ${
              activeTab === 'activities'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>Activities</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'hotels' &&
            hotels.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <img
                  src={hotel.image_url || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'}
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{hotel.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {hotel.location}
                  </p>
                  <div className="flex items-center mb-3">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-semibold">{hotel.rating}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hotel.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">${hotel.price_per_night}</span>
                      <span className="text-gray-500 text-sm">/night</span>
                    </div>
                    <button
                      onClick={() => openPayment(hotel)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {activeTab === 'transport' &&
            transports.map((transport) => (
              <div key={transport.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Plane className="w-6 h-6 text-blue-600" />
                    <span className="font-semibold text-gray-800 capitalize">{transport.type}</span>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {transport.seats_available} seats
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="font-semibold text-gray-800">{transport.origin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">To</p>
                    <p className="font-semibold text-gray-800">{transport.destination}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{new Date(transport.departure_time).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">Provider: {transport.provider}</p>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">${transport.price}</span>
                  <button
                    onClick={() => openPayment(transport)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}

          {activeTab === 'activities' &&
            activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <img
                  src={activity.image_url || 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg'}
                  alt={activity.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{activity.name}</h3>
                    {activity.category && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                        {activity.category}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{activity.destination}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description}</p>
                  {activity.duration && (
                    <p className="text-gray-500 text-sm mb-4 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {activity.duration}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">${activity.price}</span>
                    <button
                      onClick={() => openPayment(activity)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {showPayment && bookingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
              Payment Details
            </h3>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-1">Booking</p>
              <p className="font-semibold text-gray-800">
                {bookingItem.name || `${bookingItem.origin} → ${bookingItem.destination}`}
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                ${bookingItem.price || bookingItem.price_per_night}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Card Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
