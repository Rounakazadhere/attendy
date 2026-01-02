import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Class from './models/Class.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rural-attendance')
    .then(async () => {
        console.log('✅ Connected for check');
        const count = await Class.countDocuments();
        console.log(`Class Count: ${count}`);
        if (count > 0) {
            const sample = await Class.findOne();
            console.log("Sample Class:", JSON.stringify(sample.toJSON(), null, 2));
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
