import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    riderName: { type: String, required: true },
    riderDisplayName: { type: String, default: '' },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', PaymentSchema);
