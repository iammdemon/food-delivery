const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Models
const User = require('./models/User');
const Menu = require('./models/Menu');
const Order = require('./models/Order');
const TopUpRequest = require('./models/TopUpRequest');
const Payment = require('./models/Payment');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas ✅');
        console.log('Ready for operations on port ' + PORT);
    })
    .catch(err => console.error('MongoDB Connection Error ❌:', err));

mongoose.connection.on('connected', () => console.log('Mongoose: Connected to Atlas 🌐'));
mongoose.connection.on('error', (err) => console.error('Mongoose: Connection Error ❌:', err));
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
    const { username, name, role } = req.body;
    try {
        let user = await User.findOne({ username });

        if (!user) {
            // New user: use role from frontend (admin/kitchen/customer)
            user = new User({ username, name, role });
            await user.save();
        } else {
            // Existing user: Sync name, but only update role if it's a promotion to admin/kitchen
            // or if the current role is 'customer'
            const newRole = (role === 'admin' || role === 'kitchen') ? role : user.role;
            user.name = name;
            user.role = newRole;
            await user.save();
        }
        res.json(user);
    } catch (err) {
        console.error('Login Error:', err);
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
        const requests = await TopUpRequest.find().sort({ timestamp: -1 });
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
        const payments = await Payment.find().sort({ timestamp: -1 });
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

if (process.env.VERCEL) {
    module.exports = app;
} else {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT} 🚀`);
    });
}
