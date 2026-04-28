import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Star, Clock, AlertCircle } from 'lucide-react';

// LOCAL DATA IMPORTS
import { hotels as hotelsData } from '../../data/hotels';
import { transports as transportsData } from '../../data/transports';
import { activities as activitiesData } from '../../data/activities';

interface BookingInterfaceProps {
  destination?: string;
}

export function BookingInterface({ destination }: BookingInterfaceProps) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'hotels' | 'transport' | 'activities'
  >('hotels');

  const [hotels, setHotels] = useState<any[]>([]);
  const [transports, setTransports] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [bookingItem, setBookingItem] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Passenger Details
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [seat, setSeat] = useState('');

  useEffect(() => {
    loadBookingOptions();
  }, [destination]);

  const loadBookingOptions = () => {
    setLoading(true);

    try {
      const city = destination || 'BOM';

      setHotels(
        hotelsData.filter(
          (h: any) =>
            h.location === city || h.city === city
        )
      );

      setTransports(
        transportsData.filter(
          (t: any) => t.destination === city
        )
      );

      setActivities(
        activitiesData.filter(
          (a: any) => a.destination === city
        )
      );
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Updated Booking Logic
  const handleBooking = async () => {
    if (!user || !bookingItem || !name || !age) {
      setError('Please fill all passenger details');
      return;
    }

    setPaymentLoading(true);
    setError(null);

    try {
      await new Promise((res) =>
        setTimeout(res, 1500)
      );

      const pnr =
        'PNR' + Math.floor(Math.random() * 1000000);

      const existingBookings = JSON.parse(
        localStorage.getItem('bookings') || '[]'
      );

      const newBooking = {
        id: Date.now().toString(),
        type: activeTab,
        amount:
          bookingItem.price ||
          bookingItem.price_per_night ||
          0,
        payment_status: 'completed',
        booking_date: new Date().toISOString(),
        destination: destination || bookingItem.destination,
        booking_details: {
          ...bookingItem,
        },
        passenger: {
          name,
          age,
          gender,
          seat,
        },
        pnr,
        bookedAt: new Date().toISOString(),
      };

      existingBookings.push(newBooking);

      localStorage.setItem(
        'bookings',
        JSON.stringify(existingBookings)
      );

      alert(`Booking Confirmed!\nPNR: ${pnr}`);

      setShowPayment(false);
      setBookingItem(null);

      setName('');
      setAge('');
      setGender('Male');
      setSeat('');
    } catch {
      setError('Booking failed. Try again.');
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
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Book Your Journey 🇮🇳
      </h2>

      {/* TABS */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex space-x-4 border-b">
          {['hotels', 'transport', 'activities'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab as any)
                }
                className={`px-4 py-3 border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            )
          )}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border rounded-lg flex gap-3">
          <AlertCircle className="text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* HOTELS */}
          {activeTab === 'hotels' &&
            hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-xl shadow p-4"
              >
                <img
                  src={hotel.image_url}
                  className="h-40 w-full object-cover rounded"
                />

                <h3 className="font-bold mt-3">
                  {hotel.name}
                </h3>

                <p className="text-sm text-gray-500 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {hotel.location}
                </p>

                <p className="text-yellow-500 flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  {hotel.rating}
                </p>

                <div className="flex justify-between mt-3">
                  <span className="text-xl text-blue-600 font-bold">
                    ₹{hotel.price_per_night}
                  </span>

                  <button
                    onClick={() =>
                      openPayment(hotel)
                    }
                    className="bg-blue-600 text-white px-4 py-1 rounded"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}

          {/* TRANSPORT */}
          {activeTab === 'transport' &&
            transports.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl shadow p-4"
              >
                <p className="font-bold">
                  {t.type === 'flight'
                    ? '✈️ Flight'
                    : '🚆 Train'}{' '}
                  | {t.origin} → {t.destination}
                </p>

                <p className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(
                    t.departure_time
                  ).toLocaleString()}
                </p>

                <p className="text-sm text-gray-400">
                  {t.provider}
                </p>

                <div className="flex justify-between mt-3">
                  <span className="text-xl text-blue-600 font-bold">
                    ₹{t.price}
                  </span>

                  <button
                    onClick={() =>
                      openPayment(t)
                    }
                    className="bg-blue-600 text-white px-4 py-1 rounded"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}

          {/* ACTIVITIES */}
          {activeTab === 'activities' &&
            activities.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-xl shadow p-4"
              >
                <img
                  src={a.image_url}
                  className="h-40 w-full object-cover rounded"
                />

                <h3 className="font-bold mt-2">
                  {a.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {a.category}
                </p>

                <p className="text-sm text-gray-400 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {a.duration}
                </p>

                <div className="flex justify-between mt-3">
                  <span className="text-xl text-blue-600 font-bold">
                    ₹{a.price}
                  </span>

                  <button
                    onClick={() =>
                      openPayment(a)
                    }
                    className="bg-blue-600 text-white px-4 py-1 rounded"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* PAYMENT POPUP */}
      {showPayment && bookingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold mb-3">
              Passenger Details
            </h3>

            <input
              placeholder="Full Name"
              className="w-full border p-2 mb-2"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <input
              placeholder="Age"
              className="w-full border p-2 mb-2"
              value={age}
              onChange={(e) =>
                setAge(e.target.value)
              }
            />

            <select
              className="w-full border p-2 mb-2"
              value={gender}
              onChange={(e) =>
                setGender(e.target.value)
              }
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <input
              placeholder="Seat Preference"
              className="w-full border p-2 mb-4"
              value={seat}
              onChange={(e) =>
                setSeat(e.target.value)
              }
            />

            <p className="text-lg font-bold mb-4">
              ₹
              {bookingItem.price ||
                bookingItem.price_per_night}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setShowPayment(false)
                }
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleBooking}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
              >
                {paymentLoading
                  ? 'Processing...'
                  : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}