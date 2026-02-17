import mongoose from 'mongoose';

const TopUpRequestSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    amount: { type: Number, required: true },
    senderPhone: { type: String, required: true },
    screenshot: { type: String, required: true }, // Base64 or URL
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('TopUpRequest', TopUpRequestSchema);
