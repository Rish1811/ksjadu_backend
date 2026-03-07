const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    title: {
        type: String, // Optional title for accessibility or overlay
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
