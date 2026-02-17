import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    riderName: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', PaymentSchema);
