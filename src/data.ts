import { Restaurant, Store, Order } from "./types";

export const CHAMBA_HERO_IMAGE = "/src/assets/images/chamba_valley_hero_1782115116699.jpg";

export const serviceCategories = [
  {
    id: "rides",
    label: "Rides",
    subLabel: "Book a cab/moto",
    iconName: "Car", // Phosphor Fill
    bgColor: "bg-[#EDF7EF]",
    textColor: "text-[#1E6B3D]",
  },
  {
    id: "delivery",
    label: "Delivery",
    subLabel: "Scooter pick & drop",
    iconName: "Scooter",
    bgColor: "bg-[#FEF5E7]",
    textColor: "text-[#D97706]",
  },
  {
    id: "grocery",
    label: "Grocery",
    subLabel: "Fresh & daily",
    iconName: "ShoppingBagOpen",
    bgColor: "bg-[#EDF7EF]",
    textColor: "text-[#1E6B3D]",
  },
  {
    id: "food",
    label: "Food",
    subLabel: "Eats & treats",
    iconName: "Hamburger",
    bgColor: "bg-[#FFF0F0]",
    textColor: "text-[#E11D48]",
  },
  {
    id: "medicine",
    label: "Medicine",
    subLabel: "Chemist store",
    iconName: "Pill",
    bgColor: "bg-[#F3E8FF]",
    textColor: "text-[#9333EA]",
  },
  {
    id: "courier",
    label: "Courier",
    subLabel: "Send parcels",
    iconName: "Package",
    bgColor: "bg-[#E0F2FE]",
    textColor: "text-[#0284C7]",
  },
  {
    id: "shopping",
    label: "Local Shopping",
    subLabel: "Handicrafts & art",
    iconName: "Storefront",
    bgColor: "bg-[#FFF6E9]",
    textColor: "text-[#D97706]",
  },
  {
    id: "rider_net",
    label: "Rider Net",
    subLabel: "Join as team",
    iconName: "Users",
    bgColor: "bg-[#F3F4F6]",
    textColor: "text-[#4B5563]",
  }
];

export const quickActions = [
  {
    id: "ride_now",
    title: "Ride Now",
    subtitle: "Book a cab",
    iconName: "Car",
    image: "/src/assets/images/chamba_valley_hero_1782115116699.jpg", // dynamic bg preview or car icon
    bgColor: "bg-surface",
  },
  {
    id: "send_parcel",
    title: "Send Parcel",
    subtitle: "Courier delivery",
    iconName: "Package",
    bgColor: "bg-surface",
  },
  {
    id: "order_food",
    title: "Order Food",
    subtitle: "From restaurants",
    iconName: "Hamburger",
    bgColor: "bg-surface",
  },
  {
    id: "buy_grocery",
    title: "Buy Grocery",
    subtitle: "Daily essentials",
    iconName: "ShoppingBagOpen",
    bgColor: "bg-surface",
  },
];

export const stores: Store[] = [
  {
    id: "malik_general",
    name: "Malik General Store",
    category: "Grocery • Chowgan",
    rating: 4.6,
    eta: "10-15 Min",
    distance: "1.2 km",
    image: "/src/assets/images/store_malik_general_1782115144306.jpg",
    products: [
      {
        id: "m1",
        name: "Himachal Organic Multi-Flora Honey",
        price: 320,
        unit: "500g",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=400&auto=format&fit=crop",
        category: "Staples",
      },
      {
        id: "m2",
        name: "Pure Chamba Chukh (Traditional Lemon-Chilli Paste)",
        price: 180,
        unit: "250g",
        image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=400&auto=format&fit=crop",
        category: "Condiments",
      },
      {
        id: "m3",
        name: "Premium Shelled Walnut Kernels",
        price: 540,
        unit: "400g",
        image: "https://images.unsplash.com/photo-1585445490387-f47934b73b54?q=80&w=400&auto=format&fit=crop",
        category: "Dry Fruits",
      },
      {
        id: "m4",
        name: "Local Organic Kidney Beans (Rajma Chamba)",
        price: 140,
        unit: "1kg",
        image: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?q=80&w=400&auto=format&fit=crop",
        category: "Staples",
      },
      {
        id: "m5",
        name: "Kangra Valley Green Tea Leaves",
        price: 250,
        unit: "150g",
        image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=400&auto=format&fit=crop",
        category: "Beverages",
      },
    ],
  },
  {
    id: "pahadi_fresh",
    name: "Pahadi Fruit Mart",
    category: "Fresh Fruits • Chowgan",
    rating: 4.7,
    eta: "15-20 Min",
    distance: "1.4 km",
    image: "/src/assets/images/store_pahadi_fresh_1782115175766.jpg",
    products: [
      {
        id: "g-fruit-apple",
        name: "Crisp Chamba Royal Delicious Red Apples",
        price: 180,
        unit: "1kg",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=400&auto=format&fit=crop",
        category: "Fruits",
      },
      {
        id: "g-fruit-orange",
        name: "Premium Nagpur Sweet Oranges",
        price: 120,
        unit: "1kg",
        image: "https://images.unsplash.com/photo-1547514701-42782101795e?q=80&w=400&auto=format&fit=crop",
        category: "Fruits",
      },
      {
        id: "g-fruit-banana",
        name: "Pristine Ripe Bananas Bunch",
        price: 60,
        unit: "1 dozen",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=400&auto=format&fit=crop",
        category: "Fruits",
      },
      {
        id: "g-fruit-pomegranate",
        name: "Ruby Red Fresh Pomegranate",
        price: 190,
        unit: "1kg",
        image: "https://images.unsplash.com/photo-1596387071714-c3c2f974eb36?q=80&w=400&auto=format&fit=crop",
        category: "Fruits",
      },
      {
        id: "g-fruit-pear",
        name: "Sweet Local Pears (Nashpati)",
        price: 90,
        unit: "1kg",
        image: "https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?q=80&w=400&auto=format&fit=crop",
        category: "Fruits",
      },
    ],
  },
  {
    id: "sharma_medical",
    name: "Sharma Medical Store",
    category: "Medicine • Gandhi Chowk",
    rating: 4.5,
    eta: "10-15 Min",
    distance: "1.1 km",
    image: "/src/assets/images/store_sharma_medical_1782115193404.jpg",
    products: [
      {
        id: "s1",
        name: "Paracetamol 650mg Relief Tablets",
        price: 32,
        unit: "15 tabs",
        image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=400&auto=format&fit=crop",
        category: "Health",
      },
      {
        id: "s2",
        name: "Ayurvedic Cough Syrup with Honey & Tulsi",
        price: 115,
        unit: "100ml",
        image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=400&auto=format&fit=crop",
        category: "Cough & Cold",
      },
      {
        id: "s3",
        name: "Daily Multivitamins & Zinc Capsules",
        price: 240,
        unit: "30 capsules",
        image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?q=80&w=400&auto=format&fit=crop",
        category: "Vitamins",
      },
      {
        id: "s4",
        name: "Elastic Crepe Bandage for Sprains",
        price: 145,
        unit: "1 unit",
        image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=400&auto=format&fit=crop",
        category: "First Aid",
      },
      {
        id: "s5",
        name: "Insta-Cool Herbal Pain Relief Gel",
        price: 98,
        unit: "30g",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop",
        category: "Pain Relief",
      },
    ],
  },
];

export const restaurants: Restaurant[] = [
  {
    id: "cafe_hilltop",
    name: "Cafe Hilltop",
    cuisine: "Italian, Continental",
    rating: 4.6,
    eta: "20-30 min",
    avgCost: "₹250 for two",
    image: "/src/assets/images/food_pizza_1782115222246.jpg",
    items: [
      {
        id: "f1",
        name: "Margherita Rustic Mushroom Pizza",
        description: "Fresh farm basil, wild Himalayan mushrooms, rich marinara sauce, and gooey fresh cheese on a hand-tossed thin crust.",
        price: 220,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop",
        category: "Veg",
        rating: 4.7
      },
      {
        id: "f2",
        name: "Mountain Herb Garlic Pasta",
        description: "Creamy white garlic sauce tossed with fresh high-altitude herbs and penne, topped with visual microgreens.",
        price: 190,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop",
        category: "Veg",
        rating: 4.5
      },
      {
        id: "f3",
        name: "Smoked Chicken Hilltop Pizza",
        description: "Shredded kiln-smoked chicken, fire-roasted onions, local capsicum, of real oregano flavor.",
        price: 280,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop",
        category: "Non-Veg",
        rating: 4.8
      },
      {
        id: "f4",
        name: "Chamba Wild Plum mocktail",
        description: "Chilled carbonated mocktail brewed with locally harvested sweet and tart hills plums syrup.",
        price: 85,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400&auto=format&fit=crop",
        category: "Veg",
        rating: 4.6
      },
    ],
  },
  {
    id: "tibetan_kitchen",
    name: "Tibetan Kitchen",
    cuisine: "Tibetan, Chinese",
    rating: 4.5,
    eta: "15-25 min",
    avgCost: "₹200 for two",
    image: "/src/assets/images/food_momos_1782115239927.jpg",
    items: [
      {
        id: "f5",
        name: "Steamed Organic Vegetable Momos",
        description: "Hand-folded dumplings packed with local cabbage, spring onion, mountain herbs, served with spicy red chili chutney.",
        price: 120,
        image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=400&auto=format&fit=crop",
        category: "Veg",
        rating: 4.9
      },
      {
        id: "f6",
        name: "Tibetan Thukpa Noodle Soup",
        description: "Satisfying spicy hot broth with handmade pulled noodles, mountain greens, and fresh vegetable chunks.",
        price: 150,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop",
        category: "Veg",
        rating: 4.6
      },
      {
        id: "f7",
        name: "Crispy Mountain Fried Shaphaley",
        description: "Golden-crisped Tibetan deep-fried bread turnovers filled with succulent spiced chicken and herbs.",
        price: 180,
        image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=400&auto=format&fit=crop",
        category: "Non-Veg",
        rating: 4.7
      },
      {
        id: "f8",
        name: "Himalayan Yak Butter Salt Tea",
        description: "Traditional savory, energizing butter tea churned with salt and high-altitude wild tea leaves.",
        price: 60,
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400&auto=format&fit=crop",
        category: "Veg",
        rating: 4.2
      }
    ],
  },
  {
    id: "pahadi_zaika",
    name: "Pahadi Zaika",
    cuisine: "Himachali, North Indian",
    rating: 4.7,
    eta: "20-30 min",
    avgCost: "₹220 for two",
    image: "/src/assets/images/food_thali_1782115263831.jpg",
    items: [
      {
        id: "f9",
        name: "Chamba Madra Thali (Dham Special)",
        description: "The crown of legendary Chamba feast: slow-cooked chickpea in dry fruit-yogurt sauce (Madra), served with basmati ghee rice and sweet rice.",
        price: 180,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop",
        category: "Veg",
        rating: 4.9
      },
      {
        id: "f10",
        name: "Pahadi Sepu Badi spinach gravy",
        description: "Traditional sun-dried split urad dal badis boiled and fried, then simmered in a luscious velvet spinach and yogurt gravy.",
        price: 160,
        image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=400&auto=format&fit=crop",
        category: "Veg",
        rating: 4.8
      },
      {
        id: "f11",
        name: "Local Kadi Gahat Special",
        description: "Spiced sour buttermilk kadi enriched with nutritious gahat horsegram dumplings, perfect with mountain rotis.",
        price: 140,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop",
        category: "Veg",
        rating: 4.5
      },
      {
        id: "f12",
        name: "Wild Hill Apple Halwa",
        description: "Delightful warm sweet pudding prepared from caramelized mountain apples, local ghee, and organic walnuts.",
        price: 90,
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400&auto=format&fit=crop",
        category: "Veg",
        rating: 4.7
      }
    ]
  }
];

export const sampleOrders: Order[] = [
  {
    id: "ORD-9912",
    type: "Food",
    merchantName: "Tibetan Kitchen",
    itemsSummary: "Steamed Organic Vegetable Momos × 1, Butter Salt Tea × 1",
    total: 180,
    status: "Delivered",
    date: "Today, 12:45 PM",
  },
  {
    id: "ORD-9804",
    type: "Ride",
    merchantName: "Bluber Ride Service",
    itemsSummary: "Chowgan Ground ➔ Gandhi Chowk (Cab Premium)",
    total: 120,
    status: "Delivered",
    date: "Yesterday, 06:10 PM",
  }
];

export const GROCERY_CATEGORIES = [
  { id: "fruits", name: "Fruits" },
  { id: "dairy", name: "Dairy" },
  { id: "bakery", name: "Bakery" },
  { id: "beverages", name: "Beverages" },
  { id: "snacks", name: "Snacks" },
  { id: "icecream", name: "Ice Cream" },
  { id: "beauty", name: "Personal Care" },
  { id: "household", name: "Household" }
];

export const DIRECT_GROCERY_PRODUCTS = [
  // Fruits (fruits) - Standardized Photo Assets conforming exactly to the requested 18 fruits
  {
    id: "g-fruit-apple",
    name: "Crisp Royal Delicious Red Apples",
    price: 180,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-banana",
    name: "Robusta Ripe Yellow Bananas Bunch",
    price: 60,
    unit: "1 dozen",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-mango",
    name: "Sweet Premium Alphonso Mangoes",
    price: 220,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-orange",
    name: "Juicy Sweet Nagpur Oranges",
    price: 120,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1547514701-42782101795e?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-grapes",
    name: "Seedless Fresh Green Grapes Cluster",
    price: 140,
    unit: "500g",
    image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-pomegranate",
    name: "Ruby Red Fresh Pomegranate",
    price: 190,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1596387071714-c3c2f974eb36?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-watermelon",
    name: "Fresh Sliced Sweet Watermelon",
    price: 70,
    unit: "1 pc",
    image: "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-papaya",
    name: "Himalayan Ripe Sweet Papaya",
    price: 80,
    unit: "1 pc",
    image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-pineapple",
    name: "Queen Sweet Honey Gold Pineapple",
    price: 95,
    unit: "1 pc",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-kiwi",
    name: "Zespri Fresh Green Kiwis Pack",
    price: 110,
    unit: "3 pcs",
    image: "https://images.unsplash.com/photo-1585059895524-72359e06133a?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-pear",
    name: "Crisp Sweet Himalayan Pears",
    price: 130,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-guava",
    name: "Allahabad Safeda Pink Flesh Guavas",
    price: 100,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-dragon",
    name: "Exotic Pink Flesh Dragon Fruit",
    price: 150,
    unit: "1 pc",
    image: "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-strawberry",
    name: "Mahabaleshwar Sweet Red Strawberries",
    price: 120,
    unit: "200g",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-blueberry",
    name: "Imported Premium Blueberries Family Pack",
    price: 250,
    unit: "125g",
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-cherry",
    name: "Fresh Kashmiri Dark Red Cherries",
    price: 300,
    unit: "250g",
    image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-avocado",
    name: "Hass Butter Rich Fresh Avocado",
    price: 160,
    unit: "1 pc",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },
  {
    id: "g-fruit-muskmelon",
    name: "Netted Orange Sweet Muskmelon",
    price: 90,
    unit: "1 pc",
    image: "https://images.unsplash.com/photo-1571244856331-417d7b003a3d?q=80&w=400&auto=format&fit=crop",
    category: "fruits"
  },

  // Dairy (dairy)
  {
    id: "g-dairy-milk",
    name: "Amul Taaza Toned Milk (Tetra Pack)",
    price: 32,
    unit: "500ml",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400&auto=format&fit=crop",
    category: "dairy"
  },
  {
    id: "g-dairy-paneer",
    name: "Fresh Malai Cottage Cheese (Paneer)",
    price: 95,
    unit: "200g",
    image: "https://images.unsplash.com/photo-1628294895950-98053f57271b?q=80&w=400&auto=format&fit=crop",
    category: "dairy"
  },
  {
    id: "g-dairy-butter",
    name: "Amul Pasteurized Salted Butter Spread",
    price: 56,
    unit: "100g",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=400&auto=format&fit=crop",
    category: "dairy"
  },
  {
    id: "g-dairy-cheese",
    name: "Amul Cheddar Cheese Easy Slices",
    price: 140,
    unit: "200g",
    image: "https://images.unsplash.com/photo-1552763481-b11893303631?q=80&w=400&auto=format&fit=crop",
    category: "dairy"
  },
  {
    id: "g-dairy-curd",
    name: "Mother Dairy Pure Creamy Dahi (Curd)",
    price: 35,
    unit: "400g",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=400&auto=format&fit=crop",
    category: "dairy"
  },

  // Bakery (bakery)
  {
    id: "g-bake-bread",
    name: "Harvest Gold Whole Wheat Slice Bread",
    price: 45,
    unit: "1 loaf",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop",
    category: "bakery"
  },
  {
    id: "g-bake-cake",
    name: "Chocolate Fudge Lava Soft Cake",
    price: 180,
    unit: "250g",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400&auto=format&fit=crop",
    category: "bakery"
  },
  {
    id: "g-bake-buns",
    name: "Freshly Baked Soft Sesame Burger Buns",
    price: 40,
    unit: "4 pcs",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=400&auto=format&fit=crop",
    category: "bakery"
  },
  {
    id: "g-bake-muffins",
    name: "Gourmet Apple Walnut Oats Muffins",
    price: 90,
    unit: "2 pcs",
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=400&auto=format&fit=crop",
    category: "bakery"
  },

  // Beverages (beverages)
  {
    id: "g-bev-soda",
    name: "Coca Cola Zero Sugar Sparkling Can",
    price: 40,
    unit: "300ml",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop",
    category: "beverages"
  },
  {
    id: "g-bev-juice",
    name: "Real Juices 100% Active Orange Power Pack",
    price: 110,
    unit: "1L",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=400&auto=format&fit=crop",
    category: "beverages"
  },
  {
    id: "g-bev-energy",
    name: "Red Bull Original Vitalizing Energy Drink",
    price: 125,
    unit: "250ml",
    image: "https://images.unsplash.com/photo-1622560480654-d9c487375bf4?q=80&w=400&auto=format&fit=crop",
    category: "beverages"
  },
  {
    id: "g-bev-water",
    name: "Himalayan Spring Pure Mineral Water",
    price: 20,
    unit: "1L",
    image: "https://images.unsplash.com/photo-1608885898957-a599fb15e47a?q=80&w=400&auto=format&fit=crop",
    category: "beverages"
  },

  // Snacks (snacks)
  {
    id: "g-snack-chips",
    name: "Lay's Classic Salted Crispy Potato Chips",
    price: 20,
    unit: "50g",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=400&auto=format&fit=crop",
    category: "snacks"
  },
  {
    id: "g-snack-namkeen",
    name: "Haldiram's Chatpata Spicy Aloo Bhujia",
    price: 40,
    unit: "150g",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=400&auto=format&fit=crop",
    category: "snacks"
  },
  {
    id: "g-snack-biscu",
    name: "Sunfeast Dark Fantasy Choco Fills",
    price: 45,
    unit: "120g",
    image: "https://images.unsplash.com/photo-1558961309-dbdf039a82f8?q=80&w=400&auto=format&fit=crop",
    category: "snacks"
  },
  {
    id: "g-snack-cooki",
    name: "Premium Danish Butter Golden Cashew Cookies",
    price: 95,
    unit: "200g",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=400&auto=format&fit=crop",
    category: "snacks"
  },

  // Ice Cream (icecream)
  {
    id: "g-ice-vanilla",
    name: "Premium Creamy French Vanilla Bean Tub",
    price: 140,
    unit: "500ml",
    image: "https://images.unsplash.com/photo-1501443762531-d8095c37592f?q=80&w=400&auto=format&fit=crop",
    category: "icecream"
  },
  {
    id: "g-ice-chocol",
    name: "Double Chocolate Cocoa Divine Ice Cream Tub",
    price: 150,
    unit: "500ml",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=400&auto=format&fit=crop",
    category: "icecream"
  },
  {
    id: "g-ice-kulfi",
    name: "Traditional Golden Saffron Malai Kulfi Slic",
    price: 40,
    unit: "1 pc",
    image: "https://images.unsplash.com/photo-1505394033343-e36179654d42?q=80&w=400&auto=format&fit=crop",
    category: "icecream"
  },
  {
    id: "g-ice-fampack",
    name: "Royal Golden Kesar Pista Dry Fruit Tub Pack",
    price: 280,
    unit: "1L",
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=400&auto=format&fit=crop",
    category: "icecream"
  },
  {
    id: "g-ice-frozen",
    name: "Salted Butter Caramel Swirl Frozen Tub",
    price: 110,
    unit: "700ml",
    image: "https://images.unsplash.com/photo-1612203985729-70726da35725?q=80&w=400&auto=format&fit=crop",
    category: "icecream"
  },

  // Beauty & Personal (beauty)
  {
    id: "g-beau-scrub",
    name: "Satin Smooth Organic Apricot Seed Scrub",
    price: 195,
    unit: "100g",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400&auto=format&fit=crop",
    category: "beauty"
  },
  {
    id: "g-beau-rose",
    name: "Organic Chamba Pure Rose Water Facial Mist",
    price: 115,
    unit: "120ml",
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=400&auto=format&fit=crop",
    category: "beauty"
  },
  {
    id: "g-beau-soap",
    name: "Sandalwood & Turmeric Natural Cleansing Soap",
    price: 45,
    unit: "125g",
    image: "https://images.unsplash.com/photo-1607006342411-92326c074b2a?q=80&w=400&auto=format&fit=crop",
    category: "beauty"
  },
  {
    id: "g-beau-tooth",
    name: "Minty Fresh Charcoal Active Detox Toothpaste",
    price: 75,
    unit: "150g",
    image: "https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=400&auto=format&fit=crop",
    category: "beauty"
  },

  // Household (household)
  {
    id: "g-house-therm",
    name: "Insulated Stainless Steel Vacuum Hot Thermal Flask",
    price: 480,
    unit: "1L",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400&auto=format&fit=crop",
    category: "household"
  },
  {
    id: "g-house-towel",
    name: "Bamboo Fiber Extra Absorbent Soft Towels Pack",
    price: 90,
    unit: "2 rolls",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop",
    category: "household"
  },
  {
    id: "g-house-deter",
    name: "Surf Excel Easy Wash Fabric Cleansing Powder",
    price: 120,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1610557892470-76d740ead2a6?q=80&w=400&auto=format&fit=crop",
    category: "household"
  },
  {
    id: "g-house-cleaner",
    name: "Zesty Citrus All-Surface Premium Disinfectant Liquid",
    price: 110,
    unit: "500ml",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
    category: "household"
  }
];
