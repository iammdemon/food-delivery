const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Menu = require('./models/Menu');
const Order = require('./models/Order');

const demoMenu = [
    { name: 'Basmati Rice', price: 40, category: 'lunch', icon: '🍚' },
    { name: 'Chicken Bhuna', price: 120, category: 'lunch', icon: '🍗' },
    { name: 'Daal Fry', price: 30, category: 'lunch', icon: '🍲' },
    { name: 'Beef Curry', price: 180, category: 'lunch', icon: '🥩' },
    { name: 'Veg Mix', price: 50, category: 'lunch', icon: '🥗' },
    { name: 'Fish Curry', price: 110, category: 'dinner', icon: '🐟' },
    { name: 'Egg Omelette', price: 25, category: 'dinner', icon: '🍳' },
    { name: 'Lentil Soup', price: 35, category: 'dinner', icon: '🥣' },
    { name: 'Potato Vorta', price: 20, category: 'dinner', icon: '🥔' }
];

const demoUsers = [
    { username: 'admin', name: 'System Admin', role: 'admin', balance: 0 },
    { username: 'rider1', name: 'Karim Rider', role: 'rider', balance: 0 },
    { username: 'emon', name: 'Emon Customer', role: 'customer', balance: 5000, phone: '01711223344', address: 'Banani, Dhaka' }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding... 🔌');

        // Clear existing
        await User.deleteMany({});
        await Menu.deleteMany({});
        await Order.deleteMany({});

        // Insert Menu
        const createdMenu = await Menu.insertMany(demoMenu);
        console.log(`Inserted ${createdMenu.length} menu items 🍱`);

        // Insert Users
        await User.insertMany(demoUsers);
        console.log('Inserted demo users 👥');

        // Create a few demo orders for 'emon'
        const demoOrders = [
            {
                customerId: 'emon',
                customerName: 'Emon Customer',
                customerPhone: '01711223344',
                customerAddress: 'Banani, Dhaka',
                type: 'lunch',
                items: ['Basmati Rice', 'Chicken Bhuna', 'Veg Mix'],
                total: 210,
                status: 'Delivered',
                timestamp: Date.now() - 86400000 // 1 day ago
            },
            {
                customerId: 'emon',
                customerName: 'Emon Customer',
                customerPhone: '01711223344',
                customerAddress: 'Banani, Dhaka',
                type: 'dinner',
                items: ['Fish Curry', 'Potato Vorta'],
                total: 130,
                status: 'Paid',
                timestamp: Date.now()
            }
        ];
        await Order.insertMany(demoOrders);
        console.log('Inserted demo orders 📜');

        console.log('Seeding completed successfully! 🌱');
        process.exit();
    } catch (err) {
        console.error('Seeding error ❌:', err);
        process.exit(1);
    }
};

seedDB();
