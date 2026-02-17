const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'rider', 'customer', 'kitchen'], default: 'customer' },
    balance: { type: Number, default: 0 },
    phone: { type: String, default: '' },
    address: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
