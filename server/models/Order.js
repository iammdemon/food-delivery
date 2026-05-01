import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: String,
    customerAddress: String,
    type: { type: String, enum: ['lunch', 'dinner'], required: true },
    items: [String],
    total: Number,
    status: { type: String, enum: ['Paid', 'Assigned', 'Confirmed', 'Preparing', 'Sent For Delivery', 'Delivered', 'Cancelled'], default: 'Paid' },
    assignedRider: { type: String, default: '' },
    deliveryProof: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Order', OrderSchema);
