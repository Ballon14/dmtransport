import midtransClient from 'midtrans-client';

// Lazy initialization to avoid issues with SSR
let snapInstance = null;
let coreApiInstance = null;

function getSnap() {
  if (!snapInstance) {
    snapInstance = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    });
  }
  return snapInstance;
}

function getCoreApi() {
  if (!coreApiInstance) {
    coreApiInstance = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    });
  }
  return coreApiInstance;
}

// Helper to create transaction
export async function createTransaction(booking) {
  // Skip if no server key configured
  if (!process.env.MIDTRANS_SERVER_KEY) {
    console.warn('Midtrans SERVER_KEY not configured');
    return {
      success: false,
      error: 'Payment gateway not configured',
    };
  }

  const parameter = {
    transaction_details: {
      order_id: booking.orderId,
      gross_amount: booking.totalPrice,
    },
    customer_details: {
      first_name: booking.customerName,
      phone: booking.customerPhone,
      email: booking.userEmail,
    },
    item_details: [
      {
        id: booking.vehicleId.toString(),
        price: booking.pricePerDay,
        quantity: booking.totalDays,
        name: `Sewa ${booking.vehicleName} (${booking.totalDays} hari)`.substring(0, 50),
      },
    ],
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/${booking._id}`,
    },
  };

  try {
    const snap = getSnap();
    const transaction = await snap.createTransaction(parameter);
    return {
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  } catch (error) {
    console.error('Midtrans Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper to check transaction status
export async function checkTransactionStatus(orderId) {
  if (!process.env.MIDTRANS_SERVER_KEY) {
    return {
      success: false,
      error: 'Payment gateway not configured',
    };
  }

  try {
    const coreApi = getCoreApi();
    const status = await coreApi.transaction.status(orderId);
    return {
      success: true,
      data: status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Map Midtrans status to our payment status
export function mapPaymentStatus(transactionStatus, fraudStatus) {
  if (transactionStatus === 'capture') {
    if (fraudStatus === 'accept') {
      return 'paid';
    }
    return 'pending';
  } else if (transactionStatus === 'settlement') {
    return 'paid';
  } else if (transactionStatus === 'pending') {
    return 'pending';
  } else if (transactionStatus === 'deny' || transactionStatus === 'cancel') {
    return 'failed';
  } else if (transactionStatus === 'expire') {
    return 'expired';
  } else if (transactionStatus === 'refund') {
    return 'refunded';
  }
  return 'pending';
}
