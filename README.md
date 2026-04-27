# TravelHub - Full-Stack Travel Planning Platform

A comprehensive travel planning and booking platform built with React, TypeScript, and Supabase.

## Features

### User Authentication
- Email/password registration and login
- Secure authentication with Supabase Auth
- User profile management

### Trip Planning
- Input budget and travel preferences
- Specify trip type (national, international, nearby)
- Set travel dates and group size
- Choose travel style (solo, couple, family, group)
- Select preferred transport and accommodation

### Smart Recommendations
- Personalized trip suggestions based on budget
- Destination recommendations with estimated costs
- Hotel, transport, and activity suggestions
- Beautiful image galleries for each destination

### Booking System
- Browse and book hotels
- Book flights and trains
- Reserve activities and experiences
- Integrated payment interface
- Real-time availability tracking

### Social Features
- Upload and share travel photos
- Photo gallery with community content
- Like and rate photos from other travelers
- Captions and descriptions for shared memories

### Rewards System
- Earn vouchers based on photo ratings
- Automatic rewards when photos reach 4.5+ average rating
- Track reward balance and redemption history
- Voucher expiration management

### User Dashboard
- View all trips (upcoming and past)
- Track total spending
- Review booking history
- Monitor trip statistics
- Quick access to all features

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions

## Database Schema

### Core Tables

1. **user_profiles** - Extended user information
2. **trips** - Planned and completed trips
3. **trip_preferences** - Detailed trip preferences
4. **hotels** - Hotel listings
5. **transports** - Flight and train options
6. **activities** - Activity recommendations
7. **bookings** - All user bookings
8. **photos** - User-uploaded travel photos
9. **photo_ratings** - Photo ratings from users
10. **rewards** - Earned vouchers and rewards
11. **trip_suggestions** - AI-generated trip suggestions

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── booking/           # Booking interfaces
│   │   └── BookingInterface.tsx
│   ├── dashboard/         # User dashboard
│   │   └── Dashboard.tsx
│   ├── home/              # Landing page
│   │   └── HomePage.tsx
│   ├── layout/            # Layout components
│   │   └── Navbar.tsx
│   ├── rewards/           # Rewards system
│   │   └── RewardsPage.tsx
│   ├── social/            # Social features
│   │   └── PhotoGallery.tsx
│   └── trip/              # Trip planning
│       ├── TripPlanner.tsx
│       └── TripSuggestions.tsx
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── lib/
│   ├── database.types.ts  # TypeScript types
│   └── supabase.ts        # Supabase client
├── App.tsx                # Main app component
├── main.tsx              # App entry point
└── index.css             # Global styles
```

## Setup Instructions

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a Supabase project at https://supabase.com
   - Update `.env` with your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Database Setup**
   - The database schema is already created via migrations
   - Sample data for hotels, transports, and activities is pre-loaded

5. **Run the application**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Key Features Explained

### Trip Planning Flow
1. User fills out trip planner form with preferences
2. System generates personalized suggestions based on budget
3. User browses recommended destinations
4. User can proceed to book hotels, transport, and activities

### Booking Process
1. Browse available options (hotels/transport/activities)
2. View detailed information and pricing
3. Click "Book Now" to initiate payment
4. Complete payment form (mock payment gateway)
5. Booking confirmed and saved to user account

### Social & Rewards
1. Users upload travel photos with captions
2. Other users can view and rate photos (1-5 stars)
3. When a photo reaches 4.5+ average rating:
   - Automatic reward trigger
   - $50 voucher generated
   - Voucher valid for 90 days
4. Users can view and redeem rewards from Rewards page

### Dashboard Features
- **Stats Cards**: Total trips, upcoming trips, completed trips, total spent
- **Upcoming Trips**: List of future planned trips
- **Past Trips**: History of completed trips
- **Recent Bookings**: Transaction history with payment status

## Security

All tables use Row Level Security (RLS) policies:
- Users can only view/edit their own data
- Public read access for shared content (hotels, activities, photos)
- Authenticated-only access for bookings and rewards
- Proper data validation and sanitization

## Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Tailwind CSS breakpoints
- Optimized layouts for all screen sizes
- Touch-friendly interfaces

## Future Enhancements

Potential additions:
- Real payment gateway integration (Stripe/PayPal)
- Google Maps integration for location search
- Weather API for destination forecasts
- Email notifications for bookings
- Social media sharing
- Multi-language support
- Advanced filtering and search
- Trip collaboration features
- Real-time chat support

## License

MIT License
 
--Developer Name--

  Janhvi Suthar