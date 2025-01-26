const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
    try {
        const { line_items, uniqueName } = req.body;

        // Validate required fields
        if (!line_items || !uniqueName) {
            return res.status(400).json({ error: 'Missing required fields in the request body.' });
        }

        // Define success and cancel URLs
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const successUrl = `${baseUrl}/user/invitations/${uniqueName}?paid=true&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/user/invitations/${uniqueName}?paid=unpaid&session_id={CHECKOUT_SESSION_ID}`;

        // Create the checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items, // Use the line_items passed from the frontend
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.handleStripeWebhook = async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            // Mark the payment as completed in your database
            const { client_reference_id, payment_status } = session;

            if (payment_status === 'paid') {
                // Update the database with the payment success
                console.log(`Payment for session ${client_reference_id} is successful.`);
            }
        }

        res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Webhook error:', error.message);
        res.status(400).send(`Webhook error: ${error.message}`);
    }
};

exports.verifyStripeSession = async (req, res) => {
    const { session_id } = req.params;

    if (!session_id) {
        return res.status(400).json({ error: 'Missing session ID' });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);

        // Check payment status and user identity (optional)
        if (session.payment_status === 'paid') {
            // Payment successful
            return res.status(200).json({ success: true, message: 'Payment Completed!' });
        } else {
            return res.status(400).json({ message: 'Payment not completed!' });
        }
    } catch (error) {
        console.error('Error verifying Stripe session:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};




