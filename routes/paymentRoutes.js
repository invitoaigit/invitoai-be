// routes/payment.js
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


router.post('/create-order', async (req, res) => {
    try {
      const { amount, currency } = req.body;
  
      const options = {
        amount: amount * 100, 
        currency: currency || "INR", 
        receipt: "order_rcptid_11"
      };
  
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (err) {
      res.status(500).send(err);
    }
  });
  

router.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (expectedSign === razorpay_signature) {
    res.status(200).json({ message: "Payment verified successfully" });
  } else {
    res.status(400).json({ message: "Invalid signature" });
  }
});

module.exports = router;
