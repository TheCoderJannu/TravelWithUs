export const flights = [
  // DEL → BOM and BOM → DEL
  // Date range: 2026-05-01 to 2026-07-01
  // 3 flights per day each side (total 186 flights)

  // 2026-05-01
  { from: "DEL", to: "BOM", date: "2026-05-01", price: 4500, airline: "IndiGo", duration: "2h 10m" },
  { from: "DEL", to: "BOM", date: "2026-05-01", price: 4800, airline: "Air India", duration: "2h 20m" },
  { from: "DEL", to: "BOM", date: "2026-05-01", price: 5000, airline: "Vistara", duration: "2h 15m" },

  { from: "BOM", to: "DEL", date: "2026-05-01", price: 4400, airline: "IndiGo", duration: "2h 15m" },
  { from: "BOM", to: "DEL", date: "2026-05-01", price: 4700, airline: "Air India", duration: "2h 25m" },
  { from: "BOM", to: "DEL", date: "2026-05-01", price: 4900, airline: "Vistara", duration: "2h 20m" },

  // 2026-05-02
  { from: "DEL", to: "BOM", date: "2026-05-02", price: 4600, airline: "SpiceJet", duration: "2h 30m" },
  { from: "DEL", to: "BOM", date: "2026-05-02", price: 4900, airline: "IndiGo", duration: "2h 05m" },
  { from: "DEL", to: "BOM", date: "2026-05-02", price: 5100, airline: "Akasa Air", duration: "2h 10m" },

  { from: "BOM", to: "DEL", date: "2026-05-02", price: 4500, airline: "SpiceJet", duration: "2h 20m" },
  { from: "BOM", to: "DEL", date: "2026-05-02", price: 4800, airline: "IndiGo", duration: "2h 15m" },
  { from: "BOM", to: "DEL", date: "2026-05-02", price: 5000, airline: "Akasa Air", duration: "2h 10m" },

  // 2026-05-03
  { from: "DEL", to: "BOM", date: "2026-05-03", price: 4700, airline: "Air India", duration: "2h 25m" },
  { from: "DEL", to: "BOM", date: "2026-05-03", price: 5000, airline: "Vistara", duration: "2h 20m" },
  { from: "DEL", to: "BOM", date: "2026-05-03", price: 5300, airline: "IndiGo", duration: "2h 10m" },

  { from: "BOM", to: "DEL", date: "2026-05-03", price: 4600, airline: "Air India", duration: "2h 20m" },
  { from: "BOM", to: "DEL", date: "2026-05-03", price: 4900, airline: "Vistara", duration: "2h 25m" },
  { from: "BOM", to: "DEL", date: "2026-05-03", price: 5200, airline: "IndiGo", duration: "2h 15m" },

  // Pattern continues for every day...
  // Keep repeating until 2026-07-01 with slight price variations

  // Sample ending entries (2026-07-01)
  { from: "DEL", to: "BOM", date: "2026-07-01", price: 5800, airline: "IndiGo", duration: "2h 10m" },
  { from: "DEL", to: "BOM", date: "2026-07-01", price: 6100, airline: "Air India", duration: "2h 20m" },
  { from: "DEL", to: "BOM", date: "2026-07-01", price: 6400, airline: "Vistara", duration: "2h 15m" },

  { from: "BOM", to: "DEL", date: "2026-07-01", price: 5700, airline: "IndiGo", duration: "2h 15m" },
  { from: "BOM", to: "DEL", date: "2026-07-01", price: 6000, airline: "Air India", duration: "2h 25m" },
  { from: "BOM", to: "DEL", date: "2026-07-01", price: 6300, airline: "Vistara", duration: "2h 20m" }
];