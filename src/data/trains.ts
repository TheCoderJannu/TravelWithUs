export interface Train {
  id: string;
  from: string;
  to: string;
  date: string;
  name: string;
  price: number;
  duration: string;
}

export const trains: Train[] = [
  {
    id: "TR001",
    from: "DEL",
    to: "BOM",
    date: "2026-05-01",
    name: "Rajdhani Express",
    price: 1800,
    duration: "16h"
  },
  {
    id: "TR002",
    from: "DEL",
    to: "BLR",
    date: "2026-05-01",
    name: "Karnataka Express",
    price: 2000,
    duration: "30h"
  },
  {
    id: "TR003",
    from: "DEL",
    to: "BOM",
    date: "2026-05-02",
    name: "Duronto Express",
    price: 1700,
    duration: "15h"
  },
  {
    id: "TR004",
    from: "BOM",
    to: "DEL",
    date: "2026-05-01",
    name: "August Kranti Rajdhani",
    price: 1850,
    duration: "16h"
  },
  {
    id: "TR005",
    from: "DEL",
    to: "AMD",
    date: "2026-05-01",
    name: "Gujarat Mail",
    price: 900,
    duration: "14h"
  }
];