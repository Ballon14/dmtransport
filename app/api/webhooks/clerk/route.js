import { Webhook } from 'svix';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// Get admin emails from environment
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  const eventType = evt.type;

  // Connect to MongoDB
  await connectDB();

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    const email = email_addresses?.[0]?.email_address || '';
    const name = [first_name, last_name].filter(Boolean).join(' ');
    
    // Check if email is in admin list
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    try {
      await User.create({
        clerkId: id,
        email: email,
        name: name,
        imageUrl: image_url || '',
        role: isAdmin ? 'admin' : 'customer', // Auto-assign admin role if email matches
      });
      console.log(`✅ User created: ${email} (role: ${isAdmin ? 'admin' : 'customer'})`);
    } catch (error) {
      console.error('Error creating user:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    const email = email_addresses?.[0]?.email_address || '';
    const name = [first_name, last_name].filter(Boolean).join(' ');

    try {
      await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: email,
          name: name,
          imageUrl: image_url || '',
        }
      );
      console.log('✅ User updated:', email);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      await User.findOneAndDelete({ clerkId: id });
      console.log('✅ User deleted:', id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  return new Response('Webhook received', { status: 200 });
}
