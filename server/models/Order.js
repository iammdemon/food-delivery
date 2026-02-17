import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: String,
    customerAddress: String,
    type: { type: String, enum: ['lunch', 'dinner'], required: true },
    items: [String],
    total: Number,
    status: { type: String, enum: ['Pending', 'Cooking', 'Out for Delivery', 'Delivered'], default: 'Pending' },
    riderName: { type: String, default: 'Unassigned' },
    deliveryProof: { type: String, default: '' }, // New field for photo URL
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Order', OrderSchema);
