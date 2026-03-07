const mongoose = require('mongoose');

const policySchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
        unique: true, // 'terms', 'refund', 'privacy'
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

const Policy = mongoose.model('Policy', policySchema);

module.exports = Policy;
