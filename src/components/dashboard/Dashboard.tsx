import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Calendar, MapPin, DollarSign, Package, CheckCircle, Clock, Plane } from 'lucide-react';

interface Trip {
  id: string;
  destination: string;
  trip_type: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: string;
}

interface Booking {
  id: string;
  booking_type: string;
  amount: number;
  payment_status: string;
  booking_date: string;
  booking_details: any;
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

  const loadDashboardData = async () => {
    const [tripsData, bookingsData] = await Promise.all([
      supabase
        .from('trips')
        .select('*')
        .eq('user_id', user!.id)
        .order('start_date', { ascending: false }),
      supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user!.id)
        .order('booking_date', { ascending: false }),
    ]);

    if (tripsData.data) {
      setTrips(tripsData.data);
      const today = new Date().toISOString().split('T')[0];
      const upcoming = tripsData.data.filter((t) => t.start_date > today).length;
      const completed = tripsData.data.filter((t) => t.end_date < today).length;

      setStats({
        totalTrips: tripsData.data.length,
        upcomingTrips: upcoming,
        completedTrips: completed,
        totalSpent: 0,
      });
    }

    if (bookingsData.data) {
      setBookings(bookingsData.data);
      const total = bookingsData.data.reduce((sum, b) => sum + Number(b.amount), 0);
      setStats((prev) => ({ ...prev, totalSpent: total }));
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const upcomingTrips = trips.filter((t) => t.start_date > new Date().toISOString().split('T')[0]);
  const pastTrips = trips.filter((t) => t.end_date < new Date().toISOString().split('T')[0]);

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">My Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Plane className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalTrips}</p>
          <p className="text-gray-600 text-sm">Total Trips</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.upcomingTrips}</p>
          <p className="text-gray-600 text-sm">Upcoming Trips</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.completedTrips}</p>
          <p className="text-gray-600 text-sm">Completed Trips</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">${stats.totalSpent.toFixed(0)}</p>
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
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                      {trip.destination}
                    </h4>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                      {trip.trip_type}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Budget: ${Number(trip.budget).toLocaleString()}
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
              {pastTrips.slice(0, 3).map((trip) => (
                <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-green-600" />
                      {trip.destination}
                    </h4>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Budget: ${Number(trip.budget).toLocaleString()}
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="capitalize font-medium text-gray-800">{booking.booking_type}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      ${Number(booking.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.payment_status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {booking.payment_status}
                      </span>
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
