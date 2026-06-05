import { auth, db } from '../../environment/environment';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';

// ─── REPLACE THIS WITH YOUR RAZORPAY TEST KEY ID ─────────────────────────────
// Get it from: https://dashboard.razorpay.com → Settings → API Keys → Test Mode
// It looks like: rzp_test_XXXXXXXXXXXXXXXX
export const RAZORPAY_KEY_ID = 'rzp_test_XXXXXXXXXXXXXX';
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Dynamically loads the Razorpay checkout script once and reuses it.
 */
export const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load Razorpay. Check your internet connection.'));
        document.body.appendChild(script);
    });
};

/**
 * Opens the Razorpay payment modal.
 *
 * @param {Object} options
 * @param {number}   options.amount      - Amount in INR (e.g. 199)
 * @param {string}   options.planName    - 'Monthly' or 'Yearly'
 * @param {string}   options.description - Description shown in modal
 * @param {Object}   options.prefill     - { name, email, contact }
 * @param {Function} options.onSuccess   - Called with Razorpay response object
 * @param {Function} options.onFailure   - Called with Error on failure/dismiss
 */
export const openRazorpayCheckout = async ({
    amount,
    planName,
    description,
    prefill = {},
    onSuccess,
    onFailure,
}) => {
    try {
        await loadRazorpayScript();
    } catch (err) {
        if (onFailure) onFailure(err);
        return;
    }

    const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount * 100,   // Razorpay uses paise (100 paise = ₹1)
        currency: 'INR',
        name: 'Service Provider CRM',
        description: description,
        handler: function (response) {
            if (onSuccess) onSuccess(response);
        },
        prefill: {
            name:    prefill.name    || '',
            email:   prefill.email   || '',
            contact: prefill.contact || '',
        },
        notes: {
            plan: planName,
        },
        theme: {
            color: '#6366f1',
        },
        modal: {
            ondismiss: function () {
                if (onFailure) onFailure(new Error('Payment was cancelled'));
            },
        },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
        if (onFailure) onFailure(new Error(response.error.description || 'Payment failed'));
    });
    rzp.open();
};

/**
 * Saves a successful payment to Firestore and updates the SP's subscription.
 *
 * @param {Object} paymentResponse  - Razorpay success response
 * @param {string} plan             - 'monthly' | 'yearly'
 * @param {number} amount           - Amount in INR
 */
export const saveSubscriptionPayment = async (paymentResponse, plan, amount) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('User not authenticated');

    const now = new Date();
    const expiresAt = new Date(now);
    if (plan === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Save payment record to Firestore
    await addDoc(collection(db, 'payments'), {
        serviceProviderId: uid,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        plan:              plan,
        amount:            amount,
        currency:          'INR',
        status:            'paid',
        paidAt:            now,
        expiresAt:         expiresAt,
    });

    // Update subscription fields on the SP's profile document
    await updateDoc(doc(db, 'service_providers', uid), {
        subscriptionPlan:   plan,
        subscriptionStatus: 'active',
        subscriptionExpiry: expiresAt,
        lastPaymentId:      paymentResponse.razorpay_payment_id,
    });
};
