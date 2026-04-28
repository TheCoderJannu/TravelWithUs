import { useState } from "react";

export function TicketPage({ booking, onBack }: any) {
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const getAmount = () => {
    return (
      Number(booking?.amount) ||
      Number(booking?.price) ||
      Number(booking?.price_per_night) ||
      Number(booking?.fare) ||
      Number(booking?.cost) ||
      0
    );
  };

  const getBookingType = () => {
    if (booking?.airline) return "Flight";
    if (booking?.provider && booking?.type === "train") return "Train";
    if (booking?.name) return "Hotel";
    return "Booking";
  };

  const handleConfirm = () => {
    if (!name) return alert("Enter passenger name");

    const newBookingId = "TW" + Math.floor(Math.random() * 1000000);
    const finalAmount = getAmount();

    setBookingId(newBookingId);

    const existingBookings = JSON.parse(
      localStorage.getItem("bookings") || "[]"
    );

    const newBooking = {
      id: newBookingId,
      type: getBookingType().toLowerCase(),
      amount: finalAmount,
      price: finalAmount,
      payment_status: "completed",
      booking_date: new Date().toISOString(),
      bookedAt: new Date().toISOString(),
      pnr: newBookingId,
      origin: booking?.from || booking?.origin || "-",
      destination:
        booking?.to ||
        booking?.destination ||
        booking?.city ||
        booking?.location ||
        "-",
      hotel: booking?.name || "-",
      passenger: {
        name,
      },
      booking_details: {
        ...booking,
        amount: finalAmount,
        price: finalAmount,
      },
    };

    localStorage.setItem(
      "bookings",
      JSON.stringify([...existingBookings, newBooking])
    );

    setConfirmed(true);
  };

  const downloadTicket = () => {
    const ticketText = `
TravelWithUs Ticket

Booking ID: ${bookingId}
Name: ${name}
From: ${booking?.from || booking?.origin || "-"}
To: ${booking?.to || booking?.destination || booking?.city || booking?.location || "-"}
Date: ${booking?.date || "N/A"}
Booking Date: ${new Date().toLocaleDateString()}
Payment Status: Completed
Amount Paid: ₹${getAmount()}
Type: ${getBookingType()}
Details: ${booking?.airline || booking?.provider || booking?.name || "-"}
Duration: ${booking?.duration || "-"}
`;

    const blob = new Blob([ticketText], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${bookingId}-ticket.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleBackHome = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      window.location.href = "/";
    }
  };

  const displayAmount = getAmount();

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
              <p><b>From:</b> {booking?.from || booking?.origin || "-"}</p>
              <p>
                <b>To:</b>{" "}
                {booking?.to ||
                  booking?.destination ||
                  booking?.city ||
                  booking?.location ||
                  "-"}
              </p>
              <p><b>Date:</b> {booking?.date || "N/A"}</p>
              <p><b>Booking Date:</b> {new Date().toLocaleDateString()}</p>
              <p><b>Payment Status:</b> Completed</p>
              <p><b>Amount Paid:</b> ₹{displayAmount}</p>
              <p><b>Type:</b> {getBookingType()}</p>

              <p className="text-blue-600 font-bold text-lg">
                ₹{displayAmount}
              </p>

              <p className="text-sm text-gray-500">
                Booking ID: {bookingId}
              </p>
            </div>

            <button
              onClick={downloadTicket}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded font-semibold"
            >
              Download Ticket
            </button>

            <button
              onClick={handleBackHome}
              className="mt-3 w-full bg-gray-800 text-white py-2 rounded"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}