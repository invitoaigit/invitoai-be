const express = require('express');
const { createCheckoutSession, handleStripeWebhook, verifyStripeSession  } = require('../controllers/subscriptionController');

const router = express.Router();

router.post('/create-checkout-session', createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
router.post('/verify/:session_id', express.raw({ type: 'application/json' }), verifyStripeSession);

module.exports = router;
