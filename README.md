# Stripe Donation Invoice API

Creates Stripe invoices with custom donation amounts. Users specify an amount, an invoice is created, and they're redirected to Stripe's hosted payment page.

## Quick Start

### Option A: Deploy to Vercel (Recommended - Free tier)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd stripe-donation-api
   vercel
   ```

3. **Add environment variable:**
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add: `STRIPE_SECRET_KEY` = your Stripe secret key (starts with `sk_`)

4. **Redeploy** to pick up the env var:
   ```bash
   vercel --prod
   ```

5. Your API URL will be: `https://your-project.vercel.app/api/create-invoice`

---

### Option B: Deploy to Render

1. **Create a new Web Service** at [render.com](https://render.com)

2. **Connect your repo** or use the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add environment variable:**
   - `STRIPE_SECRET_KEY` = your Stripe secret key

4. Your API URL will be: `https://your-service.onrender.com/api/create-invoice`

---

## Embed in Softr

1. Open `embed/donation-form.html`

2. Update the `API_ENDPOINT` variable with your deployed URL:
   ```javascript
   const API_ENDPOINT = 'https://your-api-url.vercel.app/api/create-invoice';
   ```

3. In Softr:
   - Add a **Custom Code** or **Embed** block
   - Paste the entire contents of the HTML file

4. Customize the styling to match your site

---

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (sk_test_... or sk_live_...) |

### Getting Your Stripe Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers → API Keys
3. Use **test key** for testing, **live key** for production

---

## API Reference

### POST /api/create-invoice

Creates a Stripe invoice and returns the hosted payment URL.

**Request:**
```json
{
  "amount": 25.00,
  "email": "donor@example.com",
  "description": "Donation"
}
```

**Response:**
```json
{
  "success": true,
  "invoiceUrl": "https://invoice.stripe.com/i/acct_.../invst_...",
  "invoiceId": "in_..."
}
```

---

## Security Notes

- Never expose your `STRIPE_SECRET_KEY` in frontend code
- In production, update CORS to only allow your Softr domain
- Use Stripe's test mode keys while developing

---

## Testing

1. Use Stripe test mode keys
2. Test card: `4242 4242 4242 4242`, any future expiry, any CVC
3. Check invoices in Stripe Dashboard → Invoices
