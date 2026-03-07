const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ... (Multer config remains the same) ...

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// Multer configuration for image upload
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `user-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            image: user.image || null
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Upload user profile image
// @route   POST /api/users/profile/image
// @access  Private
router.post('/profile/image', protect, upload.single('image'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Normalize path for all OS
            let normalizePath = req.file.path.replace(/\\/g, '/');

            // Ensure path starts with /uploads not just uploads
            if (!normalizePath.startsWith('uploads/')) {
                // If it doesn't start with uploads/ check if it starts with /uploads
                if (!normalizePath.startsWith('/uploads/')) {
                    // Try to find where uploads starts
                    if (normalizePath.includes('uploads/')) {
                        normalizePath = normalizePath.substring(normalizePath.indexOf('uploads/'));
                    }
                }
            }

            // Final check
            if (!normalizePath.startsWith('/')) {
                normalizePath = '/' + normalizePath;
            }

            user.image = normalizePath;
            await user.save();

            console.log(`Image saved for ${user.email}: ${user.image}`);

            res.json({
                message: 'Image uploaded successfully',
                image: user.image
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

module.exports = router;
