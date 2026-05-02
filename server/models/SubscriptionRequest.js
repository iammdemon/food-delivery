import mongoose from 'mongoose';

const SubscriptionRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    package: { type: String, enum: ['weekly', 'monthly'], required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    timestamp: { type: Date, default: Date.now }
});

const SubscriptionRequest = mongoose.models.SubscriptionRequest || mongoose.model('SubscriptionRequest', SubscriptionRequestSchema);
export default SubscriptionRequest;
