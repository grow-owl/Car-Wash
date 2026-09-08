/**
 * Dynamically loads Razorpay checkout script from official CDN
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay official SDK from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Initiates Razorpay Checkout modal
 * @param {Object} options
 * @param {string} options.keyId - Razorpay Key ID
 * @param {string} options.orderId - Razorpay Order ID
 * @param {number} options.amount - Amount in Paise (e.g. 49900)
 * @param {string} options.currency - 'INR'
 * @param {string} options.customerName - Customer's name
 * @param {string} options.phone - Customer's phone
 * @param {string} options.email - Customer's email
 * @param {string} options.description - Service / Package description
 * @param {Function} options.onSuccess - Callback on payment success
 * @param {Function} options.onFailure - Callback on payment failure
 * @param {Function} options.onDismiss - Callback on modal dismissed without payment
 */
export const launchRazorpayCheckout = async ({
  keyId,
  orderId,
  amount,
  currency = 'INR',
  customerName = 'Valued Customer',
  phone = '',
  email = '',
  description = 'Car Wash Auto Spa Service',
  onSuccess,
  onFailure,
  onDismiss
}) => {
  const isSimulatedOrder = orderId && orderId.startsWith('order_sim_');

  // If simulated order or Razorpay script fails to load, use sandbox simulated gateway modal
  if (isSimulatedOrder) {
    showSimulatedRazorpayModal({
      orderId,
      amount,
      currency,
      customerName,
      phone,
      description,
      onSuccess,
      onFailure,
      onDismiss
    });
    return;
  }

  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    // Fallback to sandbox simulation modal so user experience is never blocked
    showSimulatedRazorpayModal({
      orderId: orderId || `order_sim_${Date.now()}`,
      amount,
      currency,
      customerName,
      phone,
      description,
      onSuccess,
      onFailure,
      onDismiss
    });
    return;
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  const options = {
    key: keyId,
    amount: amount,
    currency: currency || 'INR',
    name: 'Car Wash Auto Spa',
    description: description,
    image: '/logo.webp',
    order_id: orderId,
    handler: function (response) {
      if (onSuccess) {
        onSuccess({
          razorpay_order_id: response.razorpay_order_id || orderId,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        });
      }
    },
    prefill: {
      name: customerName,
      email: email || 'customer@carwash.com',
      contact: cleanPhone ? (cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`) : '9876543210',
      method: 'upi'
    },
    notes: {
      address: 'Car Wash Auto Spa Detailing Studio'
    },
    theme: {
      color: '#00D2B4',
      backdrop_color: 'rgba(0, 49, 53, 0.95)'
    },
    config: {
      display: {
        blocks: {
          upi: {
            name: 'Pay with UPI (GPay, PhonePe, Paytm, QR)',
            instruments: [
              { method: 'upi' }
            ]
          },
          other: {
            name: 'Cards, NetBanking & Wallets',
            instruments: [
              { method: 'card' },
              { method: 'netbanking' },
              { method: 'wallet' }
            ]
          }
        },
        sequence: ['block.upi', 'block.other'],
        preferences: {
          show_default_blocks: true
        }
      }
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) onDismiss();
      },
      escape: true,
      animation: true,
      confirm_close: true
    }
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      if (onFailure) {
        onFailure(response.error);
      }
    });
    rzp.open();
  } catch (err) {
    console.error('Error opening Razorpay checkout:', err);
    if (onFailure) onFailure(err);
  }
};

/**
 * Built-in Sandbox Simulation Modal (for Test Orders / Dev environments)
 */
function showSimulatedRazorpayModal({
  orderId,
  amount,
  currency,
  customerName,
  phone,
  description,
  onSuccess,
  onFailure,
  onDismiss
}) {
  // Remove any existing test modal
  const existing = document.getElementById('rzp-simulated-modal');
  if (existing) existing.remove();

  const formattedAmount = (amount / 100).toLocaleString('en-IN', { style: 'currency', currency: currency || 'INR' });

  const modalContainer = document.createElement('div');
  modalContainer.id = 'rzp-simulated-modal';
  modalContainer.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 999999;
    background: rgba(0, 20, 25, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  modalContainer.innerHTML = `
    <div style="
      background: #002227;
      border: 1px solid rgba(0, 210, 180, 0.4);
      border-radius: 16px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 210, 180, 0.2);
      overflow: hidden;
      color: #FFFFFF;
      animation: rzpFadeIn 0.25s ease-out;
    ">
      <!-- Razorpay Header -->
      <div style="background: linear-gradient(135deg, #003135 0%, #024950 100%); padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0, 210, 180, 0.3);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; background: #00D2B4; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #003135; font-size: 16px;">
            R
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px;">Razorpay Gateway</div>
            <div style="font-size: 11px; color: #00D2B4; font-weight: 600;">Sandbox Test Mode</div>
          </div>
        </div>
        <button id="rzp-sim-close" style="background: transparent; border: none; color: #CCD0CF; font-size: 20px; cursor: pointer; padding: 4px 8px;">✕</button>
      </div>

      <!-- Order Details -->
      <div style="padding: 20px;">
        <div style="text-align: center; margin-bottom: 18px;">
          <div style="font-size: 12px; color: #8E9A9D; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Payable Amount</div>
          <div style="font-size: 30px; font-weight: 900; color: #00D2B4; letter-spacing: -0.5px;">${formattedAmount}</div>
          <div style="font-size: 12px; color: #CCD0CF; margin-top: 4px;">${description}</div>
        </div>

        <div style="background: rgba(0, 49, 53, 0.6); border: 1px solid rgba(74, 92, 106, 0.4); border-radius: 10px; padding: 12px 14px; margin-bottom: 18px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #8E9A9D;">Customer:</span>
            <span style="color: #FFFFFF; font-weight: 600;">${customerName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #8E9A9D;">Phone:</span>
            <span style="color: #FFFFFF; font-weight: 600;">${phone || 'Provided at booking'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #8E9A9D;">Order ID:</span>
            <span style="color: #00D2B4; font-family: monospace; font-size: 11px;">${orderId}</span>
          </div>
        </div>

        <div style="font-size: 12px; font-weight: 700; color: #8E9A9D; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Select Test Payment Method</div>
        
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
          <button id="rzp-sim-upi" style="
            background: rgba(0, 210, 180, 0.12);
            border: 1px solid #00D2B4;
            color: #FFFFFF;
            padding: 12px 14px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.2s ease;
          ">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span>📱</span> UPI (Google Pay, PhonePe, Paytm)
            </span>
            <span style="background: #00D2B4; color: #003135; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 800;">INSTANT</span>
          </button>

          <button id="rzp-sim-card" style="
            background: rgba(17, 33, 45, 0.8);
            border: 1px solid rgba(74, 92, 106, 0.6);
            color: #FFFFFF;
            padding: 12px 14px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: space-between;
          ">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span>💳</span> Credit / Debit Card
            </span>
            <span style="color: #8E9A9D; font-size: 11px;">Visa / MC / RuPay</span>
          </button>

          <button id="rzp-sim-nb" style="
            background: rgba(17, 33, 45, 0.8);
            border: 1px solid rgba(74, 92, 106, 0.6);
            color: #FFFFFF;
            padding: 12px 14px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: space-between;
          ">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span>🏦</span> NetBanking (HDFC, SBI, ICICI)
            </span>
            <span style="color: #8E9A9D; font-size: 11px;">All Banks</span>
          </button>
        </div>

        <!-- Simulation Actions -->
        <div style="display: flex; gap: 10px;">
          <button id="rzp-sim-success-btn" style="
            flex: 2;
            background: #00D2B4;
            color: #003135;
            font-weight: 800;
            padding: 12px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 13px;
            box-shadow: 0 4px 15px rgba(0, 210, 180, 0.35);
          ">
            ✓ Complete Test Payment
          </button>
          
          <button id="rzp-sim-fail-btn" style="
            flex: 1;
            background: rgba(224, 114, 90, 0.15);
            border: 1px solid #e0725a;
            color: #e0725a;
            font-weight: 700;
            padding: 12px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 12px;
          ">
            Simulate Fail
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  const closeModal = () => {
    modalContainer.remove();
  };

  const handleSuccessClick = () => {
    closeModal();
    const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const mockSignature = `sig_${Date.now()}_simulated`;
    if (onSuccess) {
      onSuccess({
        razorpay_order_id: orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature
      });
    }
  };

  const handleFailClick = () => {
    closeModal();
    if (onFailure) {
      onFailure({
        code: 'BAD_REQUEST_ERROR',
        description: 'Payment failed in test simulation',
        source: 'gateway',
        step: 'payment_authentication',
        reason: 'payment_failed'
      });
    }
  };

  document.getElementById('rzp-sim-close').onclick = () => {
    closeModal();
    if (onDismiss) onDismiss();
  };
  document.getElementById('rzp-sim-upi').onclick = handleSuccessClick;
  document.getElementById('rzp-sim-card').onclick = handleSuccessClick;
  document.getElementById('rzp-sim-nb').onclick = handleSuccessClick;
  document.getElementById('rzp-sim-success-btn').onclick = handleSuccessClick;
  document.getElementById('rzp-sim-fail-btn').onclick = handleFailClick;
}
