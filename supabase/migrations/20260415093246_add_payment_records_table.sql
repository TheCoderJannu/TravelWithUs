/*
  # Add Payment Records Table

  1. New Tables
    - `payment_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `booking_id` (uuid, foreign key)
      - `payment_id` (text, payment provider ID)
      - `amount` (decimal)
      - `payment_method` (text)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `payment_records` table
    - Users can only view their own payment records
*/

CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  payment_id text NOT NULL UNIQUE,
  amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment records"
  ON payment_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment records"
  ON payment_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_booking_id ON payment_records(booking_id);
