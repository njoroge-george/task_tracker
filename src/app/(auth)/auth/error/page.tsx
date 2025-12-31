'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration. Please contact support.',
  AccessDenied: 'You do not have access to this resource.',
  Verification: 'The verification link has expired or has already been used.',
  OAuthSignin: 'Error occurred while signing in with OAuth provider.',
  OAuthCallback: 'Error occurred during OAuth callback.',
  OAuthCreateAccount: 'Could not create OAuth account.',
  EmailCreateAccount: 'Could not create email account.',
  Callback: 'Error occurred during authentication callback.',
  OAuthAccountNotLinked: 'This email is already associated with another account. Please sign in with the original provider.',
  EmailSignin: 'Error sending the verification email.',
  CredentialsSignin: 'Invalid email or password. Please try again.',
  SessionRequired: 'Please sign in to access this page.',
  Default: 'An unexpected error occurred. Please try again.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-slate-400">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-slate-300">Error Code:</span>{' '}
              {error === 'undefined' ? 'Unknown' : error}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Link href="/auth/signin" className="w-full">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <p className="text-center text-sm text-slate-500">
            If this problem persists, please{' '}
            <Link href="/support" className="text-indigo-400 hover:text-indigo-300 underline">
              contact support
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
