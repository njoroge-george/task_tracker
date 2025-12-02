'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-12 px-4 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-green-500 border-2">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">
            Payment Submitted Successfully!
          </CardTitle>
          <CardDescription className="text-center">
            Thank you for submitting your payment details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">
                  Verification In Progress
                </h3>
                <p className="text-sm text-muted-foreground">
                  We're currently verifying your M-Pesa payment. This typically takes up to 24 hours during business days.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">What happens next?</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Our team will verify your M-Pesa transaction</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>You'll receive an email confirmation once verified</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Your account will be automatically upgraded</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>All premium features will be unlocked</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-muted rounded text-sm text-muted-foreground">
            <strong>Need help?</strong> If you don't receive confirmation within 24 hours, please contact our support team with your transaction code.
          </div>

          <Button 
            onClick={() => router.push('/dashboard')} 
            className="w-full mt-6"
          >
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
