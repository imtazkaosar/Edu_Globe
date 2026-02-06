# Payment Gateway & AI Chatbot Setup Instructions

## Overview
This project now includes:
1. **Stripe Payment Gateway** - For secure course payments
2. **AI-Powered University Chatbot** - For personalized university suggestions

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

This will install:
- `stripe` - Payment processing
- `axios` - HTTP client for OpenAI API

### 2. Environment Variables
Add these to your `backend/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# OpenAI Configuration (Optional - for AI chatbot)
OPENAI_API_KEY=sk-your_openai_api_key_here
```

**Getting Stripe Keys:**
1. Sign up at https://stripe.com
2. Go to Developers > API keys
3. Copy your Secret key (starts with `sk_test_` for test mode)
4. For webhooks, go to Developers > Webhooks and create an endpoint pointing to: `https://yourdomain.com/api/payment/webhook`

**Getting OpenAI API Key (Optional):**
1. Sign up at https://platform.openai.com
2. Go to API keys section
3. Create a new API key
4. Note: If you don't provide an OpenAI key, the chatbot will use rule-based suggestions

### 3. Update Database Models
The new models are already created:
- `StudentProfile` - Stores student academic information
- `Payment` - Stores payment transactions

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

This will install:
- `@stripe/stripe-js` - Stripe.js for frontend payment processing

### 2. Environment Variables
Add to your `frontend/.env` file:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

**Getting Stripe Publishable Key:**
1. In Stripe Dashboard > Developers > API keys
2. Copy your Publishable key (starts with `pk_test_` for test mode)

## Features

### Payment Gateway
- **PaymentModal Component**: Handles Stripe payment processing
- **Payment History**: View all past transactions
- **Automatic Enrollment**: Students are automatically enrolled after successful payment

**Usage:**
```jsx
import PaymentModal from './components/PaymentModal';

<PaymentModal 
  course={courseObject} 
  onClose={() => setShowPayment(false)}
  onSuccess={() => {
    // Refresh course list or navigate
  }}
/>
```

### AI University Chatbot
- **UniversityChatbot Component**: Interactive chatbot for university suggestions
- **StudentProfileForm Component**: Comprehensive form to collect student information
- **AI-Powered Suggestions**: Uses OpenAI GPT-4 (or rule-based fallback)

**Features:**
- Collects academic information (GPA, test scores, etc.)
- Financial information (budget, scholarship needs)
- Extracurricular activities
- Work experience
- Preferences (countries, fields, degree level)
- Provides personalized university suggestions

**Usage:**
The chatbot is integrated into the "Explore Universities" page. Students can:
1. Click the floating bot button
2. Complete their profile
3. Ask for university suggestions
4. Get AI-powered recommendations

## API Endpoints

### Payment
- `POST /api/payment/create-intent` - Create payment intent
- `POST /api/payment/confirm` - Confirm payment
- `GET /api/payment/history?studentId=xxx` - Get payment history
- `POST /api/payment/webhook` - Stripe webhook (no auth required)

### Student Profile
- `POST /api/student-profile` - Create/update profile
- `GET /api/student-profile?studentId=xxx` - Get profile

### Chatbot
- `POST /api/chatbot/university-suggestions` - Get AI suggestions

## Testing

### Test Payment
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date and any CVC

### Test Chatbot
1. Complete student profile with test data
2. Ask: "What universities match my profile?"
3. Get personalized suggestions

## Notes

1. **Stripe Webhook**: For production, set up webhook endpoint in Stripe dashboard
2. **OpenAI API**: Optional but recommended for better suggestions
3. **Payment Security**: All sensitive operations happen server-side
4. **Profile Data**: Stored securely in MongoDB

## Troubleshooting

1. **Payment not working**: Check Stripe keys are correct
2. **Chatbot not responding**: Check OpenAI API key or verify rule-based fallback
3. **Profile not saving**: Check MongoDB connection
4. **Webhook not working**: Verify webhook secret and endpoint URL
