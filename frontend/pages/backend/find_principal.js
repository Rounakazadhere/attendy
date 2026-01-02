import mongoose from 'mongoose';
import User from './models/User.js';
import 'dotenv/config';

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rural-attendance')
    .then(async () => {
        const principal = await User.findOne({ role: 'PRINCIPAL' });
        console.log("PRINCIPAL FOUND:", principal);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
