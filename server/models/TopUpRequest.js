const mongoose = require('mongoose');

const TopUpRequestSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    amount: { type: Number, required: true },
    senderPhone: { type: String, required: true },
    screenshot: { type: String, required: true }, // Base64
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    timestamp: { type: Number, default: () => Date.now() }
}, { timestamps: true });

module.exports = mongoose.model('TopUpRequest', TopUpRequestSchema);
