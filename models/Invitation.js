const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    uniqueName: { type: String, required: true, unique: true },
    user: { type: String, required: true },
    template: { type: Object, default: {} },
    rsvpData: [{type: Object}],
    expiryTime: { type: Date},
    paid: {type: Boolean, default:false},
    invitesData: [{type: Object}]
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);
