import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { mapPaymentStatus } from '@/lib/midtrans';

// Verify Midtrans signature
function verifySignature(orderId, statusCode, grossAmount, serverKey) {
  const signatureKey = crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest('hex');
  return signatureKey;
}

// POST - Handle Midtrans notification
export async function POST(req) {
  try {
    const body = await req.json();
    
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      transaction_id,
      transaction_time,
      payment_type,
    } = body;

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const expectedSignature = verifySignature(order_id, status_code, gross_amount, serverKey);
    
    if (signature_key !== expectedSignature) {
      console.error('Invalid signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 403 }
      );
    }

    await connectDB();

    // Find booking by orderId
    const booking = await Booking.findOne({ orderId: order_id });
    
    if (!booking) {
      console.error('Booking not found:', order_id);
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Map and update payment status
    const newPaymentStatus = mapPaymentStatus(transaction_status, fraud_status);
    
    booking.paymentStatus = newPaymentStatus;
    booking.transactionId = transaction_id || '';
    booking.paymentMethod = payment_type || '';
    booking.transactionTime = transaction_time ? new Date(transaction_time) : new Date();
    booking.paymentDetails = body;

    // Update booking status based on payment
    if (newPaymentStatus === 'paid') {
      booking.status = 'confirmed';
    } else if (newPaymentStatus === 'failed' || newPaymentStatus === 'expired') {
      booking.status = 'cancelled';
    }

    await booking.save();

    console.log(`Payment notification processed: ${order_id} - ${transaction_status} -> ${newPaymentStatus}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing payment notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process notification' },
      { status: 500 }
    );
  }
}
