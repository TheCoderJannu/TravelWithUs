import { useState } from 'react';
import { TripPlanner } from '../trip/TripPlanner';
import { TripSuggestions } from '../trip/TripSuggestions';
import { BookingInterface } from '../booking/BookingInterface';
import { Plane, Search, Globe, Shield } from 'lucide-react';
import { flights } from '../../data/flights';
import { trains } from '../../data/trains';
import { hotels } from '../../data/hotels';

export function HomePage() {
  const [showPlanner, setShowPlanner] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string>();

  // 🔥 Active Tab
  const [activeTab, setActiveTab] = useState("flights");

  // ✈️ Inputs
  const [from, setFrom] = useState("DEL");
  const [to, setTo] = useState("BOM");
  const [date, setDate] = useState("2026-05-01");

  const [results, setResults] = useState<any[]>([]);

  // 🔍 SEARCH LOGIC
  const handleSearch = () => {
    if (activeTab === "flights") {
      setResults(
        flights.filter(f => f.from === from && f.to === to && f.date === date)
      );
    } 
    else if (activeTab === "trains") {
      setResults(
        trains.filter(t => t.from === from && t.to === to && t.date === date)
      );
    } 
    else if (activeTab === "hotels") {
      setResults(
        hotels.filter(h => h.city === to)
      );
    }
  };

  const handleTripCreated = () => setShowPlanner(false);

  const handleBookNow = (destination: string) => {
    setSelectedDestination(destination);
    setShowBooking(true);
  };

  // 🔁 ROUTING
  if (showBooking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <button onClick={() => setShowBooking(false)} className="text-blue-600 font-semibold">
          ← Back
        </button>
        <BookingInterface destination={selectedDestination} />
      </div>
    );
  }

  if (showPlanner) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <button onClick={() => setShowPlanner(false)} className="text-blue-600 font-semibold">
          ← Back
        </button>
        <TripPlanner onTripCreated={handleTripCreated} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* HERO */}
      <div className="relative h-[500px] bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-20"></div>

        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg')",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Your Journey Starts Here
          </h1>

          {/* 🔥 SEARCH BOX */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mt-6">

            {/* TABS */}
            <div className="flex gap-6 border-b pb-2 mb-4">
              {["flights", "trains", "hotels"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={
                    activeTab === tab
                      ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                      : "text-gray-400"
                  }
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* INPUTS */}
            <div className="grid md:grid-cols-4 gap-4">

              {/* FROM */}
              {activeTab !== "hotels" && (
                <div className="border p-3 rounded">
                  <p className="text-xs text-gray-500">From</p>
                  <input
                    className="w-full font-semibold outline-none"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
              )}

              {/* TO */}
              <div className="border p-3 rounded">
                <p className="text-xs text-gray-500">
                  {activeTab === "hotels" ? "City" : "To"}
                </p>
                <input
                  className="w-full font-semibold outline-none"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>

              {/* DATE */}
              {activeTab !== "hotels" && (
                <div className="border p-3 rounded">
                  <p className="text-xs text-gray-500">Date</p>
                  <input
                    type="date"
                    className="w-full font-semibold outline-none"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              )}

              {/* SEARCH BUTTON */}
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
              >
                SEARCH
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 RESULTS */}
      <div className="max-w-4xl mx-auto mt-6 px-4">

        {results.length > 0 && (
          <h2 className="text-2xl font-bold mb-4">
            {activeTab.toUpperCase()}
          </h2>
        )}

        {results.map((f, i) => (
          <div
            key={i}
            className="bg-white p-5 mb-4 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-lg">
                {activeTab === "flights"
                  ? f.airline
                  : activeTab === "trains"
                  ? f.name
                  : f.name}
              </p>

              <p className="text-gray-500">
                {activeTab === "hotels"
                  ? f.city
                  : `${from} → ${to}`}
              </p>

              <p className="text-sm text-gray-400">
                {f.duration || `⭐ ${f.rating}`}
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                ₹{f.price}
              </p>

              <button
                onClick={() => handleBookNow(to)}
                className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">

          <div className="text-center">
            <Search className="mx-auto mb-3 text-blue-600" />
            <h3 className="font-bold">Smart Planning</h3>
          </div>

          <div className="text-center">
            <Plane className="mx-auto mb-3 text-green-600" />
            <h3 className="font-bold">Easy Booking</h3>
          </div>

          <div className="text-center">
            <Globe className="mx-auto mb-3 text-purple-600" />
            <h3 className="font-bold">Social Sharing</h3>
          </div>

          <div className="text-center">
            <Shield className="mx-auto mb-3 text-yellow-600" />
            <h3 className="font-bold">Rewards</h3>
          </div>

        </div>

        <div className="mt-12">
          <TripSuggestions onBookNow={handleBookNow} />
        </div>
      </div>
    </div>
  );
}