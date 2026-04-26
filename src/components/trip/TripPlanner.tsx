import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MapPin, Calendar, DollarSign, Users, Plane, Brain as Train, Car } from 'lucide-react';

interface TripPlannerProps {
  onTripCreated: (tripId: string) => void;
}

export function TripPlanner({ onTripCreated }: TripPlannerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    tripType: 'national',
    startDate: '',
    endDate: '',
    budget: '',
    groupSize: '1',
    travelStyle: 'solo',
    transportType: 'any',
    accommodationType: 'hotel',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          destination: formData.destination,
          trip_type: formData.tripType,
          start_date: formData.startDate,
          end_date: formData.endDate,
          budget: parseFloat(formData.budget),
          group_size: parseInt(formData.groupSize),
          status: 'planned',
        })
        .select()
        .single();

      if (tripError) throw tripError;

      await supabase.from('trip_preferences').insert({
        trip_id: trip.id,
        transport_type: formData.transportType,
        accommodation_type: formData.accommodationType,
      });

      const destinations = [
        { name: 'Paris, France', type: 'international', cost: 2500, image: 'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg' },
        { name: 'Bali, Indonesia', type: 'international', cost: 1800, image: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg' },
        { name: 'Swiss Alps', type: 'international', cost: 3200, image: 'https://images.pexels.com/photos/848618/pexels-photo-848618.jpeg' },
        { name: 'Dubai, UAE', type: 'international', cost: 2200, image: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg' },
        { name: 'Maldives', type: 'international', cost: 3500, image: 'https://images.pexels.com/photos/221457/pexels-photo-221457.jpeg' },
      ];

      const suggestions = destinations
        .filter(d => d.cost <= parseFloat(formData.budget))
        .slice(0, 3);

      for (const suggestion of suggestions) {
        await supabase.from('trip_suggestions').insert({
          user_id: user.id,
          destination: suggestion.name,
          trip_type: suggestion.type,
          estimated_cost: suggestion.cost,
          highlights: ['Beautiful scenery', 'Great food', 'Rich culture'],
          description: `Explore the wonders of ${suggestion.name}`,
          image_url: suggestion.image,
        });
      }

      onTripCreated(trip.id);
    } catch (error) {
      console.error('Error creating trip:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Plan Your Next Adventure</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Destination</span>
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Where do you want to go?"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Plane className="w-4 h-4" />
              <span>Trip Type</span>
            </label>
            <select
              value={formData.tripType}
              onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="national">National</option>
              <option value="international">International</option>
              <option value="nearby">Nearby</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Start Date</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              <span>End Date</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Budget (USD)</span>
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1000"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              <span>Group Size</span>
            </label>
            <input
              type="number"
              value={formData.groupSize}
              onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
              required
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Travel Style</label>
            <select
              value={formData.travelStyle}
              onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="solo">Solo</option>
              <option value="couple">Couple</option>
              <option value="family">Family</option>
              <option value="group">Group</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Preferred Transport</label>
            <select
              value={formData.transportType}
              onChange={(e) => setFormData({ ...formData, transportType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="any">Any</option>
              <option value="flight">Flight</option>
              <option value="train">Train</option>
              <option value="bus">Bus</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Accommodation Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['hotel', 'hostel', 'resort', 'apartment'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, accommodationType: type })}
                  className={`px-4 py-3 border-2 rounded-lg font-medium capitalize transition ${
                    formData.accommodationType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Trip...' : 'Find My Perfect Trip'}
        </button>
      </form>
    </div>
  );
}
