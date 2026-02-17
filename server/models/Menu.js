const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ['lunch', 'dinner'], required: true },
    icon: { type: String, default: '🍲' }
}, { timestamps: true });

module.exports = mongoose.model('Menu', MenuSchema);
