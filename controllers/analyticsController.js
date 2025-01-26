const Analytics = require("../models/Analytics");

// Get analytics data
exports.getAnalytics = async (req, res) => {
    try {
        const analytics = await Analytics.find();
        if (!analytics) {
            return res.status(404).json({ success: false, message: "Analytics data not found" });
        }
        res.status(200).json({ success: true, data: analytics });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createDailyAnalytics = async () => {
    try {

      const today = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
      const todayDate = new Date(today).toISOString().split("T")[0];
  
      // Check if today's analytics already exists
      const existingAnalytics = await Analytics.findOne({
        createdAt: { $gte: new Date(todayDate), $lt: new Date(todayDate + "T23:59:59.999Z") }
      });
  
      if (!existingAnalytics) {
        // Create a new analytics document for today
        const newAnalytics = new Analytics();
        await newAnalytics.save();
        console.log("Daily analytics created successfully.");
      } else {
        console.log("Daily analytics already exists. No need to create.");
      }
    } catch (error) {
      console.error("Error creating daily analytics:", error.message);
    }
};