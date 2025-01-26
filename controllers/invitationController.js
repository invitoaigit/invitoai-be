const Invitation = require('../models/Invitation');
const Analytics = require("../models/Analytics");
const fs = require('fs');
const path = require('path');



exports.createInvitation = async (req, res) => {
    try {
        const { name, image, uniqueName, user, template, paid } = req.body;

        // Check if uniqueName already exists
        const existingInvitation = await Invitation.findOne({ uniqueName });
        if (existingInvitation) {
            return res.status(400).json({ error: 'The unique name already exists. Please choose a different one.' });
        }

        // Calculate expiryTime
        const currentDate = new Date();
        let expiryTime;
        if (paid) {
            expiryTime = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1)); // 1 year from now
        } else {
            expiryTime = new Date(currentDate.setDate(currentDate.getDate() + 7)); // 7 days from now
        }

        // Create new invitation
        const newInvitation = new Invitation({
            name,
            image,
            uniqueName,
            user,
            template,
            paid,
            expiryTime,
        });

        const savedInvitation = await newInvitation.save();

        // Handle analytics update
        const today = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        const todayDate = new Date(today).toISOString().split("T")[0];

        let analytics = await Analytics.findOne({
            createdAt: { $gte: new Date(todayDate), $lt: new Date(todayDate + "T23:59:59.999Z") }
        });

        if (!analytics) {
            analytics = new Analytics({ templateCount: 1 });
            await analytics.save();
        } else {
            analytics.templateCount += 1;
            await analytics.save();
        }

        res.status(201).json(savedInvitation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get all invitations
exports.getInvitations = async (req, res) => {
    try {
        const invitations = await Invitation.find();
        res.status(200).json(invitations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get an invitation by uniqueName
exports.getInvitationByUniqueName = async (req, res) => {
    try {
        const { uniqueName } = req.params;

        const invitation = await Invitation.findOne({ uniqueName });

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        res.status(200).json(invitation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an invitation by uniqueName
exports.updateInvitation = async (req, res) => {
    try {
        const { uniqueName } = req.params;
        const updatedData = req.body;

        const invitation = await Invitation.findOne({ uniqueName });

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }


        if (updatedData.paid) {
            const expiryDate = new Date(invitation.createdAt);
            expiryDate.setFullYear(expiryDate.getFullYear() + 1); 
            invitation.expiryTime = expiryDate;
            await invitation.save();
        }


        const updatedInvitation = await Invitation.findOneAndUpdate(
            { uniqueName },
            updatedData,
            { new: true }
        );

        if (!updatedInvitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        res.status(200).json(updatedInvitation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an invitation by uniqueName


exports.deleteInvitation = async (req, res) => {
    try {
        const { uniqueName } = req.params;

        // Find and delete the invitation
        const deletedInvitation = await Invitation.findOneAndDelete({ uniqueName });

        if (!deletedInvitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Define the path to the folder
        const folderPath = path.join(__dirname, '..', 'invitations_data', uniqueName);

        // Check if the folder exists and delete it
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log(`Deleted folder: ${folderPath}`);
        } else {
            console.log(`Folder not found: ${folderPath}`);
        }

        res.status(200).json({ message: 'Invitation and associated folder deleted successfully' });
    } catch (error) {
        console.error('Error deleting invitation:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const deleteExpiredInvitations = async () => {
    try {
        console.log("Checking for expired invitations!");
        const now = new Date();

        // Find expired invitations
        const expiredInvitations = await Invitation.find({ expiryTime: { $lte: now } });

        // Delete each expired invitation and its folder
        for (const invitation of expiredInvitations) {
            const folderPath = path.join(__dirname, '..', 'invitations_data', invitation.uniqueName);

            if (fs.existsSync(folderPath)) {
                fs.rmSync(folderPath, { recursive: true, force: true });
                console.log(`Deleted folder: ${folderPath}`);
            }

            await Invitation.deleteOne({ _id: invitation._id });
        }

        console.log(`Deleted ${expiredInvitations.length} expired invitations.`);
    } catch (error) {
        console.error('Error deleting expired invitations:', error.message);
    }
};




// Get invitations by user
exports.getInvitationsByUser = async (req, res) => {
    try {
        const { user } = req.params;

        const invitations = await Invitation.find({ user });

        if (invitations.length === 0) {
            return res.status(404).json({ message: 'No invitations found for this user' });
        }

        res.status(200).json(invitations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Start the interval to check every minute
setInterval(deleteExpiredInvitations, 60000);