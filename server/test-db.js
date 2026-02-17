require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing connection to:', process.env.MONGODB_URI.replace(/:[^@\/]+@/, ':****@'));

const testConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Successfully connected to MongoDB!');

        const Menu = require('./models/Menu');
        const User = require('./models/User');

        const menuCount = await Menu.countDocuments();
        const userCount = await User.countDocuments();

        console.log(`Documents found: Menu (${menuCount}), Users (${userCount})`);

        const dbs = await mongoose.connection.db.admin().listDatabases();
        console.log('Available databases:', dbs.databases.map(db => db.name));
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        if (err.reason) console.error('Reason:', JSON.stringify(err.reason, null, 2));
        process.exit(1);
    }
};

testConnection();
