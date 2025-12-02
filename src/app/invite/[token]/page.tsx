'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  workspace: {
    id: string;
    name: string;
    description: string | null;
  };
  invitedBy: {
    name: string | null;
    email: string;
    image: string | null;
  };
  createdAt: string;
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { token } = use(params);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load invitation');
        return;
      }

      setInvitation(data.invitation);
    } catch (err) {
      console.error('Error fetching invitation:', err);
      setError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!session) {
      // Redirect to sign in with callback to this page
      router.push(`/auth/signin?callbackUrl=/invite/${token}`);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to accept invitation');
        setProcessing(false);
        return;
      }

      // Auto-switch to the invited workspace for immediate interactivity
      if (data.workspaceId) {
        try {
          localStorage.setItem('currentWorkspaceId', data.workspaceId);
        } catch {}
      }

      setSuccess(true);
      // Redirect to team page with a hint to explore
      setTimeout(() => {
        router.push('/dashboard/team');
      }, 1500);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation');
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!session) {
      router.push('/');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/invitations/${token}/decline`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to decline invitation');
        setProcessing(false);
        return;
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error declining invitation:', err);
      setError('Failed to decline invitation');
      setProcessing(false);
    }
  };

  if (loading || sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  const isExpired = invitation.status === 'EXPIRED' || new Date(invitation.expiresAt) < new Date();
  const isProcessed = invitation.status === 'ACCEPTED' || invitation.status === 'DECLINED';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            {success ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : isExpired ? (
              <Clock className="h-16 w-16 text-orange-500" />
            ) : isProcessed ? (
              <XCircle className="h-16 w-16 text-gray-400" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {invitation.workspace.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {success
              ? 'Welcome Aboard!'
              : isExpired
              ? 'Invitation Expired'
              : isProcessed
              ? 'Invitation Already Processed'
              : 'Workspace Invitation'}
          </CardTitle>
          <CardDescription>
            {success
              ? `You've successfully joined ${invitation.workspace.name}`
              : isExpired
              ? 'This invitation link has expired'
              : isProcessed
              ? `This invitation has already been ${invitation.status.toLowerCase()}`
              : `You've been invited to join a workspace`}
          </CardDescription>
        </CardHeader>

        {!success && !isExpired && !isProcessed && (
          <CardContent className="space-y-6">
            {/* Workspace Info */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Workspace</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {invitation.workspace.name}
                </p>
                {invitation.workspace.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {invitation.workspace.description}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Role</p>
                <Badge variant="secondary" className="mt-1">
                  {invitation.role}
                </Badge>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={invitation.invitedBy.image || undefined} />
                  <AvatarFallback>
                    {(invitation.invitedBy.name || invitation.invitedBy.email)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Invited by</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {invitation.invitedBy.name || invitation.invitedBy.email}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expires</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Email mismatch warning */}
            {session && session.user?.email?.toLowerCase() !== invitation.email.toLowerCase() && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> This invitation was sent to{' '}
                  <span className="font-mono">{invitation.email}</span> but you're logged in as{' '}
                  <span className="font-mono">{session.user.email}</span>. You may need to sign in
                  with the correct account.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleDecline}
                variant="outline"
                disabled={processing}
                className="flex-1"
              >
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : session ? (
                  'Accept Invitation'
                ) : (
                  'Sign In to Accept'
                )}
              </Button>
            </div>
          </CardContent>
        )}

        {(isExpired || isProcessed) && (
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
