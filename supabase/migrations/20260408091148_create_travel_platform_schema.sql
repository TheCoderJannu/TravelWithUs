/*
  # Travel Planning Platform Database Schema

  ## Overview
  Complete database schema for a full-featured travel planning platform with social features,
  booking system, and rewards mechanism.

  ## Tables Created

  1. **user_profiles**
     - Extends Supabase auth.users with travel preferences
     - Fields: user_id, full_name, phone, default_budget, preferred_transport, travel_style, current_location
  
  2. **trips**
     - Stores all planned trips
     - Fields: trip_id, user_id, destination, trip_type, start_date, end_date, budget, group_size, status
  
  3. **trip_preferences**
     - Detailed preferences for each trip
     - Fields: trip_id, transport_type, accommodation_type, activities, dietary_restrictions
  
  4. **hotels**
     - Hotel listings and recommendations
     - Fields: hotel_id, name, location, price_per_night, rating, amenities, image_url
  
  5. **transports**
     - Flight, train, and bus options
     - Fields: transport_id, type, origin, destination, departure_time, arrival_time, price, provider
  
  6. **activities**
     - Activity recommendations for destinations
     - Fields: activity_id, destination, name, description, price, duration, category
  
  7. **bookings**
     - Track all bookings (hotels, transport, activities)
     - Fields: booking_id, user_id, trip_id, booking_type, item_id, amount, payment_status, booking_date
  
  8. **photos**
     - Trip photos uploaded by users
     - Fields: photo_id, user_id, trip_id, storage_path, caption, upload_date, total_likes, avg_rating
  
  9. **photo_ratings**
     - User ratings on photos
     - Fields: rating_id, photo_id, user_id, rating, created_at
  
  10. **rewards**
      - Vouchers and rewards earned
      - Fields: reward_id, user_id, voucher_code, amount, reason, earned_date, expiry_date, is_redeemed
  
  11. **trip_suggestions**
      - Cached trip suggestions based on preferences
      - Fields: suggestion_id, user_id, destination, trip_type, estimated_cost, highlights, created_at

  ## Security
  - RLS enabled on all tables
  - Policies ensure users can only access their own data
  - Public read access for shared content (photos, hotels, activities)
  - Authenticated users can rate photos and view trips
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  default_budget decimal(10,2) DEFAULT 0,
  preferred_transport text DEFAULT 'any',
  travel_style text DEFAULT 'solo',
  current_location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination text NOT NULL,
  trip_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  budget decimal(10,2) NOT NULL,
  group_size int DEFAULT 1,
  status text DEFAULT 'planned',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trip Preferences Table
CREATE TABLE IF NOT EXISTS trip_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  transport_type text DEFAULT 'any',
  accommodation_type text DEFAULT 'hotel',
  activities text[] DEFAULT '{}',
  dietary_restrictions text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trip_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view preferences for their trips"
  ON trip_preferences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_preferences.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert preferences for their trips"
  ON trip_preferences FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_preferences.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  price_per_night decimal(10,2) NOT NULL,
  rating decimal(3,2) DEFAULT 0,
  amenities text[] DEFAULT '{}',
  image_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hotels"
  ON hotels FOR SELECT
  TO authenticated
  USING (true);

-- Transports Table
CREATE TABLE IF NOT EXISTS transports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  price decimal(10,2) NOT NULL,
  provider text NOT NULL,
  seats_available int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view transports"
  ON transports FOR SELECT
  TO authenticated
  USING (true);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  duration text,
  category text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  booking_type text NOT NULL,
  item_id uuid NOT NULL,
  amount decimal(10,2) NOT NULL,
  payment_status text DEFAULT 'pending',
  booking_date timestamptz DEFAULT now(),
  booking_details jsonb DEFAULT '{}'
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Photos Table
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  caption text,
  upload_date timestamptz DEFAULT now(),
  total_likes int DEFAULT 0,
  avg_rating decimal(3,2) DEFAULT 0
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos"
  ON photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON photos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Photo Ratings Table
CREATE TABLE IF NOT EXISTS photo_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(photo_id, user_id)
);

ALTER TABLE photo_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON photo_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own ratings"
  ON photo_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON photo_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Rewards Table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voucher_code text NOT NULL UNIQUE,
  amount decimal(10,2) NOT NULL,
  reason text,
  earned_date timestamptz DEFAULT now(),
  expiry_date date,
  is_redeemed boolean DEFAULT false
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Trip Suggestions Table
CREATE TABLE IF NOT EXISTS trip_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination text NOT NULL,
  trip_type text NOT NULL,
  estimated_cost decimal(10,2) NOT NULL,
  highlights text[] DEFAULT '{}',
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trip_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suggestions"
  ON trip_suggestions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suggestions"
  ON trip_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_trip_id ON photos(trip_id);
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);

-- Function to update photo ratings when a new rating is added
CREATE OR REPLACE FUNCTION update_photo_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE photos
  SET 
    avg_rating = (
      SELECT AVG(rating)::decimal(3,2)
      FROM photo_ratings
      WHERE photo_id = NEW.photo_id
    ),
    total_likes = (
      SELECT COUNT(*)
      FROM photo_ratings
      WHERE photo_id = NEW.photo_id
    )
  WHERE id = NEW.photo_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER photo_rating_updated
  AFTER INSERT OR UPDATE ON photo_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_ratings();

-- Function to check if user deserves a reward based on photo ratings
CREATE OR REPLACE FUNCTION check_photo_rewards()
RETURNS TRIGGER AS $$
DECLARE
  photo_owner uuid;
  reward_threshold decimal;
BEGIN
  SELECT user_id INTO photo_owner FROM photos WHERE id = NEW.photo_id;
  SELECT avg_rating INTO reward_threshold FROM photos WHERE id = NEW.photo_id;
  
  IF reward_threshold >= 4.5 THEN
    INSERT INTO rewards (user_id, voucher_code, amount, reason, expiry_date)
    VALUES (
      photo_owner,
      'PHOTO-' || substring(gen_random_uuid()::text, 1, 8),
      50,
      'High-rated photo reward',
      CURRENT_DATE + INTERVAL '90 days'
    )
    ON CONFLICT (voucher_code) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_rewards_trigger
  AFTER UPDATE OF avg_rating ON photos
  FOR EACH ROW
  WHEN (NEW.avg_rating >= 4.5 AND OLD.avg_rating < 4.5)
  EXECUTE FUNCTION check_photo_rewards();