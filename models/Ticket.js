const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  user: { type: String, required: true },
  issue: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Pending",
  }

}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
