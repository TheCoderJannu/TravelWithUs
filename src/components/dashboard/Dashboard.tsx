import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Calendar,
  MapPin,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  Plane,
  Download
} from 'lucide-react';

interface Trip {
  id: string;
  destination: string;
  trip_type: string;
  start_date: string;
  end_date?: string;
  budget: number;
  status: string;
}

interface Booking {
  id?: string;
  type: string;
  destination?: string;
  origin?: string;
  amount?: number;
  bookedAt: string;
  pnr?: string;
  passenger?: {
    name?: string;
    age?: string;
    gender?: string;
    seat?: string;
  };
  price?: number;
  price_per_night?: number;
  hotel?: string;
  booking_details?: any;
}

export function Dashboard() {
  const { user } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const getBookingAmount = (booking: Booking) => {
    return Number(
      booking.amount ||
      booking.price ||
      booking.price_per_night ||
      booking.booking_details?.amount ||
      booking.booking_details?.price ||
      booking.booking_details?.price_per_night ||
      0
    );
  };

  const downloadBookings = () => {
    const bookingsData: Booking[] = JSON.parse(
      localStorage.getItem('bookings') || '[]'
    );

    if (bookingsData.length === 0) {
      alert('No bookings to download');
      return;
    }

    const headers = [
      'Type',
      'Date',
      'Amount',
      'PNR',
      'Name',
      'Origin',
      'Destination',
      'Flight',
      'Train',
      'Hotel'
    ];

    const rows = bookingsData.map((booking) => [
      booking.type || '-',
      booking.bookedAt
        ? new Date(booking.bookedAt).toLocaleDateString()
        : '-',
      getBookingAmount(booking),
      booking.pnr || '-',
      booking.passenger?.name || '-',
      booking.origin || booking.booking_details?.from || '-',
      booking.destination || booking.booking_details?.to || '-',
      booking.type === 'flight'
        ? booking.booking_details?.airline || booking.destination || '-'
        : '-',
      booking.type === 'train'
        ? booking.booking_details?.provider || booking.destination || '-'
        : '-',
      booking.type === 'hotel'
        ? booking.hotel || booking.booking_details?.name || '-'
        : '-'
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'booking-history.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  const loadDashboardData = async () => {
    try {
      const tripsData = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user!.id)
        .order('start_date', { ascending: false });

      const localBookings: Booking[] = JSON.parse(
        localStorage.getItem('bookings') || '[]'
      );

      if (tripsData.data) {
        const tripList: Trip[] = tripsData.data;

        setTrips(tripList);

        const today = new Date().toISOString().split('T')[0];

        const upcoming = tripList.filter(
          (t: Trip) => t.start_date > today
        ).length;

        const completed = tripList.filter(
          (t: Trip) => t.end_date && t.end_date < today
        ).length;

        const total = localBookings.reduce(
          (sum: number, booking: Booking) =>
            sum + getBookingAmount(booking),
          0
        );

        setStats({
          totalTrips: tripList.length,
          upcomingTrips: upcoming,
          completedTrips: completed,
          totalSpent: total,
        });
      }

      setBookings(localBookings);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  const upcomingTrips = trips.filter(
    (t: Trip) => t.start_date > today
  );

  const pastTrips = trips.filter(
    (t: Trip) => t.end_date && t.end_date < today
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          My Dashboard
        </h2>

        <button
          onClick={downloadBookings}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          <Download className="w-5 h-5" />
          Download Bookings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <Plane className="w-8 h-8 text-blue-600 mb-4" />
          <p className="text-3xl font-bold text-gray-800">{stats.totalTrips}</p>
          <p className="text-gray-600 text-sm">Total Trips</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <Clock className="w-8 h-8 text-yellow-600 mb-4" />
          <p className="text-3xl font-bold text-gray-800">{stats.upcomingTrips}</p>
          <p className="text-gray-600 text-sm">Upcoming Trips</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <CheckCircle className="w-8 h-8 text-green-600 mb-4" />
          <p className="text-3xl font-bold text-gray-800">{stats.completedTrips}</p>
          <p className="text-gray-600 text-sm">Completed Trips</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <DollarSign className="w-8 h-8 text-purple-600 mb-4" />
          <p className="text-3xl font-bold text-gray-800">
            ₹{stats.totalSpent.toFixed(0)}
          </p>
          <p className="text-gray-600 text-sm">Total Spent</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-yellow-600" />
            Upcoming Trips
          </h3>

          {upcomingTrips.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming trips</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingTrips.map((trip: Trip) => (
                <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <h4 className="font-semibold text-gray-800 flex items-center mb-2">
                    <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                    {trip.destination}
                  </h4>

                  <div className="text-sm text-gray-600 mb-2">
                    {new Date(trip.start_date).toLocaleDateString()} -{' '}
                    {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'N/A'}
                  </div>

                  <div className="text-sm text-gray-600">
                    Budget: ₹{Number(trip.budget).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
            Past Trips
          </h3>

          {pastTrips.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No past trips</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastTrips.slice(0, 3).map((trip: Trip) => (
                <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <h4 className="font-semibold text-gray-800 flex items-center mb-2">
                    <MapPin className="w-4 h-4 mr-1 text-green-600" />
                    {trip.destination}
                  </h4>

                  <div className="text-sm text-gray-600 mb-2">
                    {new Date(trip.start_date).toLocaleDateString()} -{' '}
                    {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'N/A'}
                  </div>

                  <div className="text-sm text-gray-600">
                    Budget: ₹{Number(trip.budget).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Package className="w-6 h-6 mr-2 text-purple-600" />
          Recent Bookings
        </h3>

        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">PNR</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Origin</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Flight</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Train</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hotel</th>
                </tr>
              </thead>

              <tbody>
                {bookings.slice(0, 5).map((booking, index) => (
                  <tr key={booking.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 capitalize font-medium text-gray-800">
                      {booking.type || '-'}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {booking.bookedAt
                        ? new Date(booking.bookedAt).toLocaleDateString()
                        : '-'}
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-800">
                      ₹{getBookingAmount(booking).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-blue-600 font-semibold">
                      {booking.pnr || '-'}
                    </td>

                    <td className="py-3 px-4 text-blue-600 font-semibold">
                      {booking.passenger?.name || '-'}
                    </td>

                    <td className="py-3 px-4 text-blue-600 font-semibold">
                      {booking.origin || booking.booking_details?.from || '-'}
                    </td>

                    <td className="py-3 px-4 text-blue-600 font-semibold">
                      {booking.type === 'flight'
                        ? booking.destination || booking.booking_details?.to || '-'
                        : '-'}
                    </td>

                    <td className="py-3 px-4 text-blue-600 font-semibold">
                      {booking.type === 'train'
                        ? booking.destination || '-'
                        : '-'}
                    </td>

                    <td className="py-3 px-4 text-blue-600 font-semibold">
                      {booking.type === 'hotel'
                        ? booking.hotel || booking.booking_details?.name || '-'
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}