const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customerId: { type: String, required: true }, // Using username/ID as string for simplicity with current login
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    customerAddress: { type: String },
    type: { type: String, enum: ['lunch', 'dinner'], required: true },
    items: [{ type: String }],
    total: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Assigned', 'Delivered'], default: 'Paid' },
    assignedRider: { type: String, default: null },
    deliveryProof: { type: String, default: null }, // Base64 string or URL
    timestamp: { type: Number, default: () => Date.now() }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
