import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ['lunch', 'dinner'], required: true },
    image: { type: String, default: '' }
});

export default mongoose.model('Menu', MenuSchema);
