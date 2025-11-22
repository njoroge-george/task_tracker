import { NextResponse } from 'next/server';
import { sendNotificationEmail } from '@/lib/email';

// POST /api/test-email - Test email configuration
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to } = body;
    
    if (!to) {
      return NextResponse.json(
        { error: 'Email address required. Provide "to" field.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Send test email
    await sendNotificationEmail({
      to,
      title: '🧪 Test Email from TaskTracker',
      message: 'Congratulations! If you received this email, your SMTP configuration is working correctly. Your email service is properly configured and ready to send notifications.',
      link: process.env.NEXTAUTH_URL + '/dashboard',
    });

    return NextResponse.json({ 
      success: true,
      message: `Test email sent successfully to ${to}! Check your inbox (and spam folder).`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Test email failed:', error);
    
    // Provide helpful error messages
    let errorMessage = 'Failed to send test email';
    let errorDetails = error.message;
    
    if (error.message.includes('Missing credentials')) {
      errorMessage = 'SMTP configuration missing';
      errorDetails = 'Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in your .env file';
    } else if (error.message.includes('Invalid login')) {
      errorMessage = 'SMTP authentication failed';
      errorDetails = 'Check your SMTP_USER and SMTP_PASSWORD. For Gmail, use an app password.';
    } else if (error.message.includes('ECONNECTION') || error.message.includes('ETIMEDOUT')) {
      errorMessage = 'Cannot connect to SMTP server';
      errorDetails = 'Check SMTP_HOST and SMTP_PORT. Verify firewall settings.';
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET /api/test-email - Check email configuration status
export async function GET() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  
  const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);
  
  return NextResponse.json({
    configured: isConfigured,
    config: {
      host: SMTP_HOST || 'Not set',
      port: SMTP_PORT || 'Not set',
      user: SMTP_USER || 'Not set',
      from: SMTP_FROM || 'Not set',
      passwordSet: Boolean(SMTP_PASSWORD),
    },
    message: isConfigured 
      ? 'Email is configured. Use POST method to send a test email.'
      : 'Email is not configured. Please set SMTP variables in .env file.',
  });
}
