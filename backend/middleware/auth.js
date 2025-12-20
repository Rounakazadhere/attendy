import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_change_this_later');
            console.log('DEBUG: Token Decoded', decoded);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');
            console.log('DEBUG: User Found?', !!req.user);

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error('❌ MiddleWare Auth Error:', error.message);
            res.status(401).json({ error: 'Not authorized', details: error.message });
        }
    }

    if (!token) {
        console.log("❌ MiddleWare: No Token Provided");
        res.status(401).json({ error: 'Not authorized - No Token Provided' });
    }
};
