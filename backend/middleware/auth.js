import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_this_later';
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('DEBUG: Token Decoded', decoded);

            const userId = decoded?.id || decoded?._id || decoded?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Not authorized', details: 'Invalid token payload: missing user id' });
            }

            // Get user from the token
            req.user = await User.findById(userId).select('-password');
            console.log('DEBUG: User Found?', !!req.user);

            if (!req.user) {
                return res.status(401).json({ error: 'Not authorized', details: 'User not found' });
            }

            return next();
        } catch (error) {
            console.error('❌ MiddleWare Auth Error:', error.message);
            return res.status(401).json({ error: 'Not authorized', details: error.message });
        }
    }

    if (!token) {
        console.log("❌ MiddleWare: No Token Provided");
        return res.status(401).json({ error: 'Not authorized - No Token Provided' });
    }
};
