/**
 * seed.js
 * Populates MongoDB with realistic sample users and accommodation listings.
 * Run with: node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Accommodation = require('./models/Accommodation');
const Reservation = require('./models/Reservation');

dotenv.config();

// ─── Sample Users ─────────────────────────────────────────────────────────────
const users = [
  {
    username: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
  },
  {
    username: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password321',
    role: 'host',
  },
  {
    username: 'Admin User',
    email: 'admin@airbnb.com',
    password: 'admin123',
    role: 'admin',
  },
];

// ─── Sample Accommodations ────────────────────────────────────────────────────
// Using free-to-use Unsplash image URLs for realistic visuals
const accommodations = [
  // ── New York ──────────────────────────────────────────────────────────────
  {
    title: 'Modern Apartment in New York',
    location: 'New York',
    description:
      'Stay in the heart of New York City in this modern, fully furnished apartment. Walking distance to Central Park, Times Square, and world-class dining. High-speed WiFi and all amenities included.',
    type: 'Entire apartment',
    price: 320,
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: [
      'WiFi',
      'Kitchen',
      'Free parking',
      'Air conditioning',
      'TV',
      'Washer',
    ],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    ],
    weeklyDiscount: 10,
    cleaningFee: 50,
    serviceFee: 45,
    occupancyTaxes: 30,
    host: 'Johann',
    rating: 4.8,
    reviews: 320,
    enhancedCleaning: true,
    selfCheckIn: true,
    specificRatings: {
      cleanliness: 4.8,
      communication: 4.7,
      checkIn: 4.9,
      accuracy: 4.6,
      location: 4.9,
      value: 4.5,
    },
  },

  {
    title: 'Cozy Studio Near Times Square',
    location: 'New York',
    description:
      'Charming studio apartment just 5 minutes walk from Times Square. Perfect for solo travelers or couples exploring NYC. Recently renovated with modern decor.',
    type: 'Entire apartment',
    price: 180,
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [
      'WiFi',
      'Kitchen',
      'Air conditioning',
      'TV',
      'Elevator',
    ],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800',
    ],
    weeklyDiscount: 5,
    cleaningFee: 30,
    serviceFee: 25,
    occupancyTaxes: 20,
    host: 'Sarah',
    rating: 4.6,
    reviews: 187,
    enhancedCleaning: true,
    selfCheckIn: false,
    specificRatings: {
      cleanliness: 4.7,
      communication: 4.8,
      checkIn: 4.5,
      accuracy: 4.6,
      location: 5.0,
      value: 4.4,
    },
  },

  // ── Paris ─────────────────────────────────────────────────────────────────
  {
    title: 'Elegant Flat Near Eiffel Tower',
    location: 'Paris',
    description:
      'Beautiful Haussmann-style apartment with views of the Eiffel Tower. Located in the 7th arrondissement, steps away from cafes, bakeries, and the Seine river.',
    type: 'Entire apartment',
    price: 280,
    guests: 3,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Kitchen', 'Heating', 'TV', 'Balcony', 'Washer'],
    images: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    ],
    weeklyDiscount: 12,
    cleaningFee: 60,
    serviceFee: 40,
    occupancyTaxes: 25,
    host: 'Marie',
    rating: 4.9,
    reviews: 412,
    enhancedCleaning: true,
    selfCheckIn: true,
    specificRatings: {
      cleanliness: 5.0,
      communication: 4.9,
      checkIn: 4.8,
      accuracy: 4.9,
      location: 5.0,
      value: 4.7,
    },
  },

  {
    title: 'Charming Montmartre Studio',
    location: 'Paris',
    description:
      "Quaint studio in the artistic Montmartre neighbourhood. Steps from Sacré-Cœur and the famous artists' square. Authentic Parisian experience awaits.",
    type: 'Private room',
    price: 120,
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Kitchen', 'Heating', 'TV'],
    images: [
      'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=800',
      'https://images.unsplash.com/photo-1463620695885-8a91d87c53d0?w=800',
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    ],
    weeklyDiscount: 8,
    cleaningFee: 25,
    serviceFee: 18,
    occupancyTaxes: 15,
    host: 'Pierre',
    rating: 4.7,
    reviews: 256,
    enhancedCleaning: false,
    selfCheckIn: true,
    specificRatings: {
      cleanliness: 4.6,
      communication: 5.0,
      checkIn: 4.9,
      accuracy: 4.7,
      location: 4.8,
      value: 4.8,
    },
  },

  // ── Cape Town ─────────────────────────────────────────────────────────────
  {
    title: 'Luxury Villa with Ocean View',
    location: 'Cape Town',
    description:
      'Stunning villa perched on the slopes of Table Mountain with breathtaking views of the Atlantic Ocean. Private pool, gourmet kitchen, and a short drive to Clifton Beach.',
    type: 'Villa',
    price: 550,
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: [
      'WiFi',
      'Pool',
      'Kitchen',
      'Free parking',
      'Air conditioning',
      'BBQ',
      'Garden',
      'TV',
    ],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ],
    weeklyDiscount: 15,
    cleaningFee: 120,
    serviceFee: 80,
    occupancyTaxes: 50,
    host: 'Thabo',
    rating: 4.9,
    reviews: 98,
    enhancedCleaning: true,
    selfCheckIn: false,
    specificRatings: {
      cleanliness: 5.0,
      communication: 4.9,
      checkIn: 4.8,
      accuracy: 5.0,
      location: 5.0,
      value: 4.7,
    },
  },

  {
    title: 'Beach Cottage in Cape Town',
    location: 'Cape Town',
    description:
      'Cozy beach cottage just 50 metres from Boulders Beach. Watch the African penguins from your porch! Perfect for couples and families seeking a unique coastal escape.',
    type: 'Beach house',
    price: 220,
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: [
      'WiFi',
      'Kitchen',
      'Free parking',
      'BBQ',
      'Garden',
      'Beach access',
    ],
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800',
    ],
    weeklyDiscount: 10,
    cleaningFee: 45,
    serviceFee: 35,
    occupancyTaxes: 22,
    host: 'Nomsa',
    rating: 4.8,
    reviews: 143,
    enhancedCleaning: true,
    selfCheckIn: true,
    specificRatings: {
      cleanliness: 4.9,
      communication: 4.8,
      checkIn: 5.0,
      accuracy: 4.7,
      location: 5.0,
      value: 4.8,
    },
  },

  // ── Tokyo ─────────────────────────────────────────────────────────────────
  {
    title: 'Traditional Machiya Townhouse',
    location: 'Tokyo',
    description:
      'Experience authentic Japanese living in this beautifully restored 100-year-old machiya townhouse. Features a tatami room, zen garden, and is walking distance from Asakusa Temple.',
    type: 'Entire house',
    price: 240,
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: [
      'WiFi',
      'Kitchen',
      'Heating',
      'Washing machine',
      'Zen garden',
      'Tatami room',
    ],
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800',
    ],
    weeklyDiscount: 10,
    cleaningFee: 55,
    serviceFee: 38,
    occupancyTaxes: 28,
    host: 'Yuki',
    rating: 4.9,
    reviews: 204,
    enhancedCleaning: true,
    selfCheckIn: true,
    specificRatings: {
      cleanliness: 5.0,
      communication: 4.9,
      checkIn: 4.9,
      accuracy: 5.0,
      location: 4.8,
      value: 4.7,
    },
  },

  {
    title: 'Modern Pod in Shibuya',
    location: 'Tokyo',
    description:
      'Sleek and modern private room in the heart of Shibuya. Steps from the famous crossing, nightlife, and shopping. Ideal for solo travelers wanting to immerse in Tokyo culture.',
    type: 'Private room',
    price: 95,
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Air conditioning', 'TV', 'Locker storage'],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    ],
    weeklyDiscount: 5,
    cleaningFee: 15,
    serviceFee: 12,
    occupancyTaxes: 10,
    host: 'Kenji',
    rating: 4.5,
    reviews: 389,
    enhancedCleaning: false,
    selfCheckIn: true,
    specificRatings: {
      cleanliness: 4.5,
      communication: 4.6,
      checkIn: 4.9,
      accuracy: 4.4,
      location: 5.0,
      value: 4.7,
    },
  },

  // ── London ────────────────────────────────────────────────────────────────
  {
    title: 'Georgian Townhouse in Chelsea',
    location: 'London',
    description:
      "Stunning 4-bedroom Georgian townhouse in the prestigious Chelsea neighbourhood. Period features combined with modern luxury. Close to the King's Road and the Thames.",
    type: 'Entire house',
    price: 480,
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: [
      'WiFi',
      'Kitchen',
      'Free parking',
      'Garden',
      'Fireplace',
      'Washer',
      'TV',
      'Heating',
    ],
    images: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
      'https://images.unsplash.com/photo-1520013817300-1f4c753931e9?w=800',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    ],
    weeklyDiscount: 12,
    cleaningFee: 100,
    serviceFee: 70,
    occupancyTaxes: 45,
    host: 'Oliver',
    rating: 4.8,
    reviews: 67,
    enhancedCleaning: true,
    selfCheckIn: false,
    specificRatings: {
      cleanliness: 4.9,
      communication: 4.7,
      checkIn: 4.6,
      accuracy: 4.8,
      location: 4.9,
      value: 4.5,
    },
  },

  {
    title: 'Bright Flat in Notting Hill',
    location: 'London',
    description:
      'Colourful and characterful flat in the heart of Notting Hill. Near Portobello Road Market, great restaurants, and Hyde Park. A true London experience.',
    type: 'Entire apartment',
    price: 195,
    guests: 3,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Kitchen', 'Heating', 'TV', 'Washer'],
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800',
    ],
    weeklyDiscount: 8,
    cleaningFee: 40,
    serviceFee: 28,
    occupancyTaxes: 22,
    host: 'Emma',
    rating: 4.7,
    reviews: 231,
    enhancedCleaning: false,
    selfCheckIn: true,
    specificRatings: {
      cleanliness: 4.8,
      communication: 4.9,
      checkIn: 4.7,
      accuracy: 4.6,
      location: 4.9,
      value: 4.6,
    },
  },

  // ── Bali ──────────────────────────────────────────────────────────────────
  {
    title: 'Tropical Villa with Private Pool',
    location: 'Bali',
    description:
      'Luxurious villa surrounded by lush rice terraces in Ubud. Private infinity pool, daily breakfast included, and personal concierge. The ultimate Bali retreat.',
    type: 'Villa',
    price: 350,
    guests: 6,
    bedrooms: 3,
    bathrooms: 3,
    amenities: [
      'WiFi',
      'Pool',
      'Kitchen',
      'Breakfast',
      'Air conditioning',
      'Garden',
      'TV',
      'Parking',
    ],
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
      'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=800',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
    ],
    weeklyDiscount: 20,
    cleaningFee: 80,
    serviceFee: 55,
    occupancyTaxes: 35,
    host: 'Wayan',
    rating: 4.9,
    reviews: 178,
    enhancedCleaning: true,
    selfCheckIn: false,
    specificRatings: {
      cleanliness: 5.0,
      communication: 5.0,
      checkIn: 4.9,
      accuracy: 4.9,
      location: 4.8,
      value: 4.8,
    },
  },

  {
    title: "Surfer's Bungalow in Seminyak",
    location: 'Bali',
    description:
      "Laid-back bungalow a 2-minute walk from Seminyak Beach. Perfect for surfers and beach lovers. Outdoor shower, hammock, and proximity to Bali's best beach clubs.",
    type: 'Cabin',
    price: 85,
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [
      'WiFi',
      'Air conditioning',
      'Outdoor shower',
      'Hammock',
      'Breakfast',
    ],
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    ],
    weeklyDiscount: 15,
    cleaningFee: 20,
    serviceFee: 12,
    occupancyTaxes: 8,
    host: 'Ketut',
    rating: 4.6,
    reviews: 302,
    enhancedCleaning: false,
    selfCheckIn: true,
    specificRatings: {
      cleanliness: 4.5,
      communication: 4.8,
      checkIn: 4.9,
      accuracy: 4.6,
      location: 5.0,
      value: 4.9,
    },
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in your .env file');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Accommodation.deleteMany({});
    await Reservation.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ─────────────────────────────────────────────────────────────────────────
    // Create users
    //
    // IMPORTANT:
    // We hash the passwords here and use insertMany() instead of User.create().
    // This avoids triggering a problematic save middleware that is causing:
    // "next is not a function"
    // ─────────────────────────────────────────────────────────────────────────

    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);

    console.log(`👤 Created ${createdUsers.length} users`);

    // Attach host_id (Jane Doe is a host) to listings
    const hostUser = createdUsers.find((user) => user.role === 'host');

    if (!hostUser) {
      throw new Error('Host user was not created successfully');
    }

    const accommodationsWithHost = accommodations.map((acc) => ({
      ...acc,
      host_id: hostUser._id,
    }));

    // Use insertMany here as well so any problematic save middleware
    // does not interfere with the seed process.
    const createdAccommodations = await Accommodation.insertMany(
      accommodationsWithHost
    );

    console.log(
      `🏠 Created ${createdAccommodations.length} accommodations`
    );

    console.log('\n📋 Seeded Locations:');

    const locations = [
      ...new Set(createdAccommodations.map((accommodation) => accommodation.location)),
    ];

    locations.forEach((location) => {
      const count = createdAccommodations.filter(
        (accommodation) => accommodation.location === location
      ).length;

      console.log(`   ${location}: ${count} listings`);
    });

    console.log('\n✅ Database seeded successfully!');

    console.log('\n🔐 Test Credentials:');
    console.log('   Admin  → admin@airbnb.com   / admin123');
    console.log('   Host   → jane@example.com   / password321');
    console.log('   User   → john@example.com   / password123');

    await mongoose.connection.close();

    console.log('\n🔌 MongoDB connection closed.');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding error:', err.message);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore connection close errors
    }

    process.exit(1);
  }
};

seedDatabase();