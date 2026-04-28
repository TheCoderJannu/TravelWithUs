import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MapPin, DollarSign } from 'lucide-react';

interface Suggestion {
  id: string;
  destination: string;
  trip_type: string;
  estimated_cost: number;
  highlights: string[];
  description: string | null;
  image_url: string | null;
}

interface TripSuggestionsProps {
  onBookNow: (destination: string) => void;
}

export function TripSuggestions({ onBookNow }: TripSuggestionsProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSuggestions();
    }
  }, [user]);

  const loadSuggestions = async () => {
    const { data, error } = await supabase
      .from('trip_suggestions')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(6);

    if (!error && data) {
      setSuggestions(data);
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

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No suggestions yet. Plan a trip to get personalized recommendations!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Recommended Destinations</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={suggestion.image_url || 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg'}
                alt={suggestion.destination}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                {suggestion.trip_type}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                {suggestion.destination}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {suggestion.description}
              </p>

              <div className="flex items-center mb-4">
                <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-lg font-bold text-green-600">
                  ${suggestion.estimated_cost.toLocaleString()}
                </span>
                <span className="text-gray-500 text-sm ml-1">estimated</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {suggestion.highlights.slice(0, 3).map((highlight, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onBookNow(suggestion.destination)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Explore & Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
