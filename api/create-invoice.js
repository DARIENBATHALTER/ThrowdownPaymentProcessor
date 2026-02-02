// Vercel Serverless Function - /api/create-invoice.js
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CORS headers for embedded form
const headers = {
  'Access-Control-Allow-Origin': '*', // Replace with your Softr domain in production
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).set(headers).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).set(headers).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { amount, email, description } = req.body;

    // Validate amount (in dollars, convert to cents)
    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (isNaN(amountInCents) || amountInCents < 100) {
      res.status(400).set(headers).json({ error: 'Minimum donation is $1.00' });
      return;
    }

    if (amountInCents > 99999900) {
      res.status(400).set(headers).json({ error: 'Amount too large' });
      return;
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
      days_until_due: 0, // Due immediately
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

    // Finalize the invoice to generate the hosted payment page
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    res.status(200).set(headers).json({
      success: true,
      invoiceUrl: finalizedInvoice.hosted_invoice_url,
      invoiceId: finalizedInvoice.id,
    });

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).set(headers).json({
      error: 'Failed to create invoice',
      message: error.message
    });
  }
};
