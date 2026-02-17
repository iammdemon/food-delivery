const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    riderName: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    timestamp: { type: Number, default: () => Date.now() }
});

module.exports = mongoose.model('Payment', paymentSchema);
