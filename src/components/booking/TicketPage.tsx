import { useState } from "react";

export function TicketPage({ booking, onBack }: any) {
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const bookingId = "TW" + Math.floor(Math.random() * 1000000);

  const handleConfirm = () => {
    if (!name) return alert("Enter passenger name");
    setConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">

      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">

        {!confirmed ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Passenger Details</h2>

            <input
              type="text"
              placeholder="Enter your name"
              className="w-full border p-3 rounded mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <button
              onClick={handleConfirm}
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
            >
              Confirm Booking
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              🎉 Booking Confirmed
            </h2>

            <div className="space-y-2 text-gray-700">
              <p><b>Name:</b> {name}</p>
              <p><b>From:</b> {booking?.from || "-"}</p>
              <p><b>To:</b> {booking?.to || booking?.city}</p>
              <p><b>Date:</b> {booking?.date || "N/A"}</p>

              <p>
                <b>Type:</b>{" "}
                {booking?.airline || booking?.name || "Hotel"}
              </p>

              <p className="text-blue-600 font-bold text-lg">
                ₹{booking?.price}
              </p>

              <p className="text-sm text-gray-500">
                Booking ID: {bookingId}
              </p>
            </div>

            <button
              onClick={onBack}
              className="mt-4 w-full bg-gray-800 text-white py-2 rounded"
            >
              Back to Home
            </button>
          </>
        )}

      </div>
    </div>
  );
}