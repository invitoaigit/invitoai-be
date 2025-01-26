const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
    userCount: { 
        type: Number, 
        default: 0 
    },
    templateCount: { 
        type: Number, 
        default: 0 
    },
}, { timestamps: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
