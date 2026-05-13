import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Replicate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Models (Assuming models are also updated to ESM or handled correctly)
// Since we are in a mixed environment, we might need to use dynamic imports or ensure models are adaptable.
// But typically for a Vite project, we should just use ESM everywhere.
// Let's assume standard requires for models might need update if they are .js files in this package.
// We will use standard imports for them assuming they export default or named exports.
// If models use module.exports, we can still import them but might need default.

import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Menu from './models/Menu.js';
import Order from './models/Order.js';
import TopUpRequest from './models/TopUpRequest.js';
import Payment from './models/Payment.js';
import SubscriptionRequest from './models/SubscriptionRequest.js';

// Connect to MongoDB (Serverless Optimized)
let cachedConnection = null;

const connectToDatabase = async (req, res, next) => {
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    if (mongoose.connection && mongoose.connection.readyState === 1) {
        return next();
    }

    try {
        if (!cachedConnection) {
            console.log('Creating new MongoDB connection...');
            cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000
            });
            console.log('MongoDB Connected ✅');
            // Drop the stale unique email index so users without email don't conflict
            try {
                await mongoose.connection.collection('users').dropIndex('email_1');
                console.log('Dropped stale email_1 index ✅');
            } catch (_) { /* index didn't exist — that's fine */ }
        }
        next();
    } catch (err) {
        console.error('MongoDB Connection Error ❌:', err);
        // Explicitly printing the error stack and name for Vercel logs
        console.error(err.stack);
        res.status(500).json({
            error: 'Database connection failed',
            details: err.message,
            code: err.code,
            name: err.name
        });
    }
};

// Use connection middleware for all API routes
app.use(connectToDatabase);

// Events
mongoose.connection.on('disconnected', () => console.log('Mongoose: Disconnected ⚠️'));

// --- API Routes ---

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// 1. Auth / User Routes
app.post('/api/auth/login', async (req, res) => {
    const { username, name, role, email } = req.body;
    try {
        let user = await User.findOne({ username });

        // Helper to generate the next auto-incremented EFC ID starting from 1001
        const generateNextCustomId = async () => {
            const lastUser = await User.findOne({ customId: /^EFC-/ }).sort({ customId: -1 });
            let nextNum = 1001;
            if (lastUser && lastUser.customId) {
                const match = lastUser.customId.match(/\d+/);
                if (match) {
                    nextNum = parseInt(match[0], 10) + 1;
                }
            }
            // Ensure uniqueness
            let customId = `EFC-${nextNum}`;
            while (await User.findOne({ customId })) {
                nextNum++;
                customId = `EFC-${nextNum}`;
            }
            return customId;
        };

        if (!user) {
            const customId = await generateNextCustomId();
            // New user: use role from frontend (admin/kitchen/customer)
            user = new User({ username, name, role, customId, email: email || null });
            await user.save();
        } else {
            // Existing user: Sync name, but only update role if it's a promotion to admin/kitchen
            // or if the current role is 'customer'
            const newRole = (role === 'admin' || role === 'kitchen') ? role : user.role;
            user.name = name;
            user.role = newRole;
            if (email) user.email = email;
            if (!user.customId) {
                user.customId = await generateNextCustomId();
            }
            await user.save();
        }
        res.json(user);
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: create a user with a hashed password stored in MongoDB
app.post('/api/admin/create-user', async (req, res) => {
    const { username, name, email, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
    try {
        const generateNextCustomId = async () => {
            const lastUser = await User.findOne({ customId: /^EFC-/ }).sort({ customId: -1 });
            let nextNum = 1001;
            if (lastUser?.customId) {
                const match = lastUser.customId.match(/\d+/);
                if (match) nextNum = parseInt(match[0], 10) + 1;
            }
            let customId = `EFC-${nextNum}`;
            while (await User.findOne({ customId })) { nextNum++; customId = `EFC-${nextNum}`; }
            return customId;
        };

        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ error: 'Username already exists' });

        const passwordHash = await bcrypt.hash(password, 10);
        const customId = await generateNextCustomId();
        const user = new User({ username, name: name || username, email: email || null, passwordHash, role: role || 'customer', customId });
        await user.save();
        res.json(user);
    } catch (err) {
        console.error('Admin Create User Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Get User Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/users/:username/profile', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { username: req.params.username },
            req.body,
            { new: true }
        );
        res.json(user);
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/users/:username/role', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { username: req.params.username },
            { role: req.body.role },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:username', async (req, res) => {
    try {
        await User.findOneAndDelete({ username: req.params.username });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Menu Routes
app.get('/api/menu', async (req, res) => {
    try {
        const menuItems = await Menu.find();
        const formattedMenu = {
            lunch: menuItems.filter(i => i.category === 'lunch'),
            dinner: menuItems.filter(i => i.category === 'dinner')
        };
        res.json(formattedMenu);
    } catch (err) {
        console.error('Get Menu Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/menu', async (req, res) => {
    try {
        const newItem = new Menu(req.body);
        await newItem.save();
        res.json(newItem);
    } catch (err) {
        console.error('Add Menu Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/menu/:id', async (req, res) => {
    try {
        await Menu.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Menu Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 3. Order Routes
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ timestamp: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Get Orders Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();

        // Deduct from user balance
        await User.findOneAndUpdate(
            { username: req.body.customerId },
            { $inc: { balance: -req.body.total } }
        );

        res.json(newOrder);
    } catch (err) {
        console.error('Place Order Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/orders/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedOrder);
    } catch (err) {
        console.error('Update Order Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 4. Top-Up Routes
app.get('/api/topup', async (req, res) => {
    try {
        const filter = req.query.userId ? { userId: req.query.userId } : {};
        const requests = await TopUpRequest.find(filter).sort({ timestamp: -1 });
        res.json(requests);
    } catch (err) {
        console.error('Get Topups Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/topup', async (req, res) => {
    try {
        const newRequest = new TopUpRequest(req.body);
        await newRequest.save();
        res.json(newRequest);
    } catch (err) {
        console.error('Add Topup Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/topup/:id/approve', async (req, res) => {
    try {
        const request = await TopUpRequest.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });

        // Credit the user
        await User.findOneAndUpdate(
            { username: request.userId },
            { $inc: { balance: request.amount } }
        );

        res.json(request);
    } catch (err) {
        console.error('Approve Topup Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/topup/:id/reject', async (req, res) => {
    try {
        const request = await TopUpRequest.findByIdAndUpdate(req.params.id, { status: 'Rejected' }, { new: true });
        res.json(request);
    } catch (err) {
        console.error('Reject Topup Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 5. Rider Routes
app.get('/api/riders', async (req, res) => {
    try {
        const riders = await User.find({ role: 'rider' });
        res.json(riders);
    } catch (err) {
        console.error('Get Riders Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/riders', async (req, res) => {
    try {
        const { name } = req.body;
        const username = name.toLowerCase().replace(/\s+/g, '_');

        // Promotion logic: if user exists, make them a rider. If not, create them.
        const rider = await User.findOneAndUpdate(
            { username },
            {
                name,
                role: 'rider',
                $setOnInsert: { balance: 0 }
            },
            { new: true, upsert: true }
        );

        res.json(rider);
    } catch (err) {
        console.error('Add Rider Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 6. Rider Payment Routes
app.get('/api/payments', async (req, res) => {
    try {
        const filter = req.query.rider ? { riderName: req.query.rider } : {};
        const payments = await Payment.find(filter).sort({ timestamp: -1 });
        res.json(payments);
    } catch (err) {
        console.error('Get Payments Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const newPayment = new Payment(req.body);
        await newPayment.save();
        res.json(newPayment);
    } catch (err) {
        console.error('Add Payment Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 7. Subscription Request Routes
app.get('/api/subscriptions', async (req, res) => {
    try {
        const requests = await SubscriptionRequest.find().sort({ timestamp: -1 });
        res.json(requests);
    } catch (err) {
        console.error('Get Subscriptions Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/subscriptions', async (req, res) => {
    try {
        const newRequest = new SubscriptionRequest(req.body);
        await newRequest.save();
        res.json(newRequest);
    } catch (err) {
        console.error('Add Subscription Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/subscriptions/:id', async (req, res) => {
    try {
        const updatedRequest = await SubscriptionRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRequest);
    } catch (err) {
        console.error('Update Subscription Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/subscriptions/:id', async (req, res) => {
    try {
        await SubscriptionRequest.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Subscription Error:', err);
        res.status(500).json({ error: err.message });
    }
});

if (process.env.VERCEL) {
    // For Vercel, we export the app instance
} else {
    // For local dev, we listen
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT} 🚀`);
    });
}

export default app;
