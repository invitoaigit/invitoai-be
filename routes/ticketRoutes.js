const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");

// Create a new ticket
router.post("/", ticketController.createTicket);

// Get all tickets
router.get("/", ticketController.getAllTickets);

// Get tickets by user ID
router.get("/user/:userId", ticketController.getTicketsByUser);

// Get a ticket by ID
router.get("/:ticketId", ticketController.getTicketById);

// Update a ticket's status
router.put("/:ticketId", ticketController.updateTicket);

// Delete a ticket
router.delete("/:ticketId", ticketController.deleteTicket);

module.exports = router;
