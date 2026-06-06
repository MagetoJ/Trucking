# TruckHub - Truck Hailing Platform Frontend

A modern, fully-featured truck-hailing platform frontend built with Next.js 16, React, Tailwind CSS, and shadcn/ui components. The application connects shippers with drivers for efficient freight delivery with real-time tracking and payments.

## 🎯 Project Overview

This is a production-ready frontend that supports both Shippers and Drivers with role-based UI, authentication, real-time tracking, and comprehensive management features. All pages are designed and ready for backend integration.

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (auth store)
- **Data Fetching**: SWR (ready for integration)
- **Real-Time**: Firebase SDK (configured)
- **Maps**: Google Maps API (ready for integration)
- **Icons**: Lucide React

### Color Scheme
- **Primary**: Navy Blue (#0F3460)
- **Accent**: Orange (#FF6B35)
- **Neutrals**: White, Grays
- **UI**: Semantic color tokens for theming

## 📁 Project Structure

```
app/
├── page.tsx                          # Landing page with hero and CTAs
├── auth/
│   ├── login/page.tsx               # Phone + password login
│   ├── register/page.tsx            # Multi-step registration (Shipper/Driver)
│   └── verify/page.tsx              # Phone verification with OTP
├── dashboard/
│   ├── layout.tsx                   # Dashboard layout with sidebar navigation
│   ├── page.tsx                     # Role-based dashboard home
│   ├── users/
│   │   ├── page.tsx                # User listing with search/filter
│   │   └── [id]/page.tsx           # Individual user profile detail
│   ├── tracking/page.tsx           # Real-time shipment/trip tracking
│   ├── shipper/
│   │   ├── post-load/page.tsx      # Create new shipment
│   │   ├── active-bookings/page.tsx # View active bookings
│   │   ├── booking-details/[id]/page.tsx  # Booking details (stub)
│   │   └── payment-method/page.tsx  # Payment methods (stub)
│   └── driver/
│       ├── available-loads/page.tsx # Browse available loads
│       ├── my-trips/page.tsx       # Active and completed trips
│       ├── trip-details/[id]/page.tsx # Trip details (stub)
│       └── earnings/page.tsx       # Earnings & withdrawal management
├── api/
│   └── auth/
│       ├── login/route.ts          # Login endpoint
│       └── register/route.ts       # Registration endpoint
│   └── users/
│       ├── route.ts                # List users with filtering
│       └── [id]/route.ts           # Get user profile
└── globals.css                      # Tailwind + semantic color tokens

components/
└── ui/
    └── button.tsx                  # shadcn button component

lib/
└── store.ts                        # Zustand auth store with persistence
```

## 🔐 Authentication Pages

### Landing Page (`/`)
- Hero section with "Connect Shippers with Drivers" messaging
- Call-to-action buttons for "I need a truck" (Shipper) and "I want to earn" (Driver)
- Features overview cards
- Navigation links to Login/Register

### Login Page (`/auth/login`)
- Phone number input
- Password field with show/hide toggle
- Sign In button with loading state
- Link to Create Account
- Demo credentials display box
- Form validation

### Register Page (`/auth/register`)
- **Step 1**: Role selection (Shipper/Driver) + Full Name + Phone
- **Step 2**: Email + Password + Confirm Password with validation
- **Step 3**: Review summary before account creation
- Multi-step progress bar
- Back/Next navigation
- Form validation and error handling

### Phone Verification Page (`/auth/verify`)
- 6-digit OTP input field
- Numeric keyboard input
- Resend Code button
- Success state with checkmark animation
- Auto-redirect on verification

## 📊 Dashboard Pages

### Dashboard Home (`/dashboard`)
**For Shippers:**
- Stats: Active Bookings, Total Spent, Completed, Rating
- Quick action buttons: Post Load, View Bookings
- Recent activity feed with load status

**For Drivers:**
- Stats: This Month Earnings, Active Trips, Completed, Rating
- Quick action buttons: Find Loads, View My Trips
- Available loads preview with distance and pricing

### Users Pages

#### Users Listing (`/dashboard/users`)
- Search by name, phone, or email
- Filter by user type (All/Shippers/Drivers)
- User cards with avatar, name, rating, verification badge
- Contact information display
- User count statistics
- Click to view profile

#### User Profile Detail (`/dashboard/users/[id]`)
- Large profile header with avatar and verification badge
- Rating with star display
- Bio and member since information
- Contact information (Phone, Email, Location)
- Stats cards (Trips/Shipments, Completion Rate, Earnings/Spent)
- For Drivers: Vehicle information with status
- Reviews section with author, rating, and comments
- Member info and metrics

### Shipper Pages

#### Post Load (`/dashboard/shipper/post-load`)
- Origin/Destination location inputs
- Cargo description textarea
- Weight and dimensions fields
- Pickup date picker
- Offered price input
- Form validation and submission

#### Active Bookings (`/dashboard/shipper/active-bookings`)
- List of active bookings with route information
- Driver name and booking date
- Progress bar with status
- ETA display
- Price and action button
- Status badges (Pending, Picked Up, In Transit)

### Driver Pages

#### Available Loads (`/dashboard/driver/available-loads`)
- Browse loads with origin/destination
- Weight and cargo type badges
- Distance from driver
- Posting time
- Offered price
- Filter by distance range
- Accept Load button

#### My Trips (`/dashboard/driver/my-trips`)
- List of all driver trips
- Route information with progress bar
- Trip status (In Progress, Completed, Upcoming)
- ETA and earnings per trip
- Status color coding

#### Earnings (`/dashboard/driver/earnings`)
- Total earnings, total trips, average per trip, pending payout
- Earnings by month with trip breakdown
- Withdraw earnings form with validation
- Minimum payout requirement display

### Shared Pages

#### Real-Time Tracking (`/dashboard/tracking`)
- Search by Booking ID or Trip ID
- Live map placeholder (Google Maps ready)
- Trip information card with route and distance
- Driver information with avatar and rating
- Vehicle information
- Pricing breakdown
- Journey timeline with status milestones
- Progress percentage display

#### Dashboard Layout
- Collapsible sidebar with toggle
- Logo and navigation menu
- Role-specific menu items (Common + Role-Based)
- User profile card in sidebar footer
- Top bar with user greeting and avatar
- Logout button

## 🔗 API Routes

All API routes are stubbed and ready for backend connection:

### Auth Routes
- `POST /api/auth/login` - Login with phone and password
- `POST /api/auth/register` - Register new user

### Users Routes
- `GET /api/users` - List users with optional filtering (query: userType, search)
- `GET /api/users/[id]` - Get single user profile

### Ready for Implementation (Stubs)
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List user bookings
- `POST /api/bookings/[id]/accept` - Driver accepts load
- `POST /api/bookings/[id]/complete` - Mark trip complete
- `GET /api/tracking/[tripId]` - Get trip data
- `POST /api/payments/init` - Initiate payment
- `GET /api/earnings` - Get driver earnings

## 🎨 Design Features

### UI Components
- Professional card-based layouts
- Progress bars and timelines
- Stat cards with icons
- Form inputs with validation
- Modal/dialog ready
- Responsive grid layouts
- Hover and active states

### Responsive Design
- Mobile-first approach
- Tailwind breakpoints (md:, lg:)
- Touch-friendly buttons and inputs
- Collapsible navigation

### Color Theming
- Navy blue primary color
- Orange accent color
- Semantic color tokens
- Dark mode support ready
- Proper contrast ratios

## 🚀 Getting Started

### Installation
```bash
# Clone and install
git clone <repo>
cd truck-hub
pnpm install
```

### Development
```bash
pnpm dev
```

Navigate to `http://localhost:3000`

### Demo Credentials
- **Shipper**: +254712345678 / password
- **Driver**: +254712345679 / password

## 📝 State Management

### Zustand Auth Store (`lib/store.ts`)
```typescript
- user: Current authenticated user
- token: JWT token
- login(): Promise - Login with phone/password
- register(): Promise - Register new user
- logout(): void - Clear auth state
- setUser(): void - Update user data
```

Automatically persists to localStorage.

## 🔌 Backend Integration Checklist

- [ ] Connect auth login/register endpoints
- [ ] Implement JWT token validation
- [ ] Set up user database schema
- [ ] Add password hashing
- [ ] Implement phone verification SMS
- [ ] Connect booking creation/management
- [ ] Connect payments (M-Pesa, Stripe)
- [ ] Implement Google Maps API for tracking
- [ ] Set up Firebase Realtime Database
- [ ] Add image upload/storage
- [ ] Implement review/rating system
- [ ] Add notification system

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## 🤝 Contributing

The frontend is ready for backend integration. Follow the API route stubs for endpoint implementation.

## 📄 License

[Your License Here]

---

**Built with Next.js 16, React 19, Tailwind CSS, and shadcn/ui**
