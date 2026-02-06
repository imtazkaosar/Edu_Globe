import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { X, CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import SummaryApi from '../common';

// Note: You'll need to install @stripe/stripe-js
// npm install @stripe/stripe-js
let stripePromise;
const loadStripe = async () => {
  if (!stripePromise) {
    const stripeModule = await import('@stripe/stripe-js');
    stripePromise = stripeModule.loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

const PaymentModal = ({ course, onClose, onSuccess }) => {
  const user = useSelector((state) => state?.user?.user);
  const studentId = user?._id || user?.id;
  
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'processing', 'success', 'error'
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [cardElement, setCardElement] = useState(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await loadStripe();
        setStripe(stripeInstance);
      } catch (err) {
        console.error('Error loading Stripe:', err);
        toast.error('Payment system initialization failed');
      }
    };
    initializeStripe();
  }, []);

  useEffect(() => {
    if (stripe && clientSecret) {
      const elementsInstance = stripe.elements({ clientSecret });
      setElements(elementsInstance);

      const card = elementsInstance.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#9e2146',
          },
        },
      });
      card.mount('#card-element');
      setCardElement(card);

      return () => {
        card.unmount();
      };
    }
  }, [stripe, clientSecret]);

  // Create payment intent when modal opens
  useEffect(() => {
    if (course && studentId) {
      createPaymentIntent();
    }
  }, [course, studentId]);

  const createPaymentIntent = async () => {
    setLoading(true);
    try {
      const res = await fetch(SummaryApi.createPaymentIntent.url, {
        method: SummaryApi.createPaymentIntent.method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId,
          courseId: course._id,
          amount: course.price || 0,
          currency: 'usd',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setClientSecret(data.clientSecret);
        setPaymentId(data.paymentId);
      } else {
        toast.error(data.message || 'Failed to initialize payment');
        onClose();
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      toast.error('Failed to initialize payment');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !cardElement) {
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.name || 'Student',
            email: user?.email || '',
          },
        },
      });

      if (error) {
        setPaymentStatus('error');
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const confirmRes = await fetch(SummaryApi.confirmPayment.url, {
          method: SummaryApi.confirmPayment.method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            paymentId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        const confirmData = await confirmRes.json();
        if (confirmRes.ok && confirmData.success) {
          setPaymentStatus('success');
          toast.success('Payment successful! You have been enrolled in the course.');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } else {
          setPaymentStatus('error');
          toast.error(confirmData.message || 'Payment confirmation failed');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentStatus('error');
      toast.error('Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4 backdrop-blur-sm">
      <div className="glass-strong rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-gray-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {paymentStatus === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
            <p className="text-gray-600 dark:text-gray-400">You have been enrolled in the course.</p>
          </div>
        ) : paymentStatus === 'error' ? (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Failed</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please try again.</p>
            <button
              onClick={() => {
                setPaymentStatus(null);
                createPaymentIntent();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Payment
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Payment</h2>
              <p className="text-gray-600 dark:text-gray-400">Course: {course.Course_Name || course.Course_Initial}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${course.price || 0}
              </p>
            </div>

            {loading && !clientSecret ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Card Information
                  </label>
                  <div className="p-4 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800">
                    <div id="card-element" className="py-2"></div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !stripe || !clientSecret}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay ${course.price || 0}
                    </>
                  )}
                </button>
              </form>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              Secure payment powered by Stripe
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
