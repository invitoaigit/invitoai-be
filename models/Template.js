const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true},
    youtubeLink: { type: String},
    description: { type: String},
    price: { type: String, required: true },
    live: { type: Boolean, default: false},
    currency: { type: String, required: true },
    discount: { type: String, default: '0%' },
    templateData: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
