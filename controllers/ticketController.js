const Ticket = require("../models/Ticket");

// Create a new ticket
exports.createTicket = async (req, res) => {
    try {
        const { user, issue } = req.body;

        const ticket = new Ticket({ user, issue });
        await ticket.save();

        res.status(201).json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all tickets
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().populate("user");
        res.status(200).json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get tickets by user
exports.getTicketsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("USER", userId)
        const tickets = await Ticket.find({ user: userId });

        res.status(200).json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get a single ticket by ID
exports.getTicketById = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await Ticket.findById(ticketId).populate("user");
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update a ticket's status
exports.updateTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;

        const ticket = await Ticket.findByIdAndUpdate({_id: ticketId}, { status }, { new: true });
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await Ticket.findByIdAndDelete(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        res.status(200).json({ success: true, message: "Ticket deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
