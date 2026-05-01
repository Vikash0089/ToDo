const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

const isAdmin = async (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

module.exports = { auth, isAdmin };