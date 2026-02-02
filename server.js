// Express Server for Render deployment
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({
  origin: '*', // Replace with your Softr domain in production
  methods: ['POST', 'OPTIONS'],
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'stripe-donation-api' });
});

// Create invoice endpoint
app.post('/api/create-invoice', async (req, res) => {
  try {
    const { amount, email, description } = req.body;

    // Validate amount (in dollars, convert to cents)
    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (isNaN(amountInCents) || amountInCents < 100) {
      return res.status(400).json({ error: 'Minimum donation is $1.00' });
    }

    if (amountInCents > 99999900) {
      return res.status(400).json({ error: 'Amount too large' });
    }

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({ email });
    }

    // Create the invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: 0,
      auto_advance: true,
    });

    // Add the donation line item
    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: amountInCents,
      currency: 'usd',
      description: description || 'Donation',
    });

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    res.json({
      success: true,
      invoiceUrl: finalizedInvoice.hosted_invoice_url,
      invoiceId: finalizedInvoice.id,
    });

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({
      error: 'Failed to create invoice',
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
