import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Menu from './models/Menu.js';
import Order from './models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

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
    { username: 'admin', name: 'Admin', role: 'admin', balance: 0 },
    { username: 'tisa', name: 'Tisa', role: 'rider', balance: 0 },
    { username: 'lamia', name: 'Lamia', role: 'customer', balance: 5000, phone: '01711223344', address: 'Banani, Dhaka' }
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

        // Create a few demo orders for 'lamia'
        const demoOrders = [
            {
                customerId: 'lamia',
                customerName: 'Lamia',
                customerPhone: '01711223344',
                customerAddress: 'Banani, Dhaka',
                type: 'lunch',
                items: ['Basmati Rice', 'Chicken Bhuna', 'Veg Mix'],
                total: 210,
                status: 'Delivered',
                timestamp: Date.now() - 86400000 // 1 day ago
            },
            {
                customerId: 'lamia',
                customerName: 'Lamia',
                customerPhone: '01711223344',
                customerAddress: 'Banani, Dhaka',
                type: 'dinner',
                items: ['Fish Curry', 'Potato Vorta'],
                total: 130,
                status: 'Pending',
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
