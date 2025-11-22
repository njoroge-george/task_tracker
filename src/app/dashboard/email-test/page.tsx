'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Mail, Loader2, ExternalLink, Copy, Check } from 'lucide-react';

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const checkConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await fetch('/api/test-email');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to check config:', error);
    } finally {
      setConfigLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!email) {
      setResult({ success: false, message: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ success: false, message: `${data.error}: ${data.details}` });
      }
    } catch (error: any) {
      setResult({ success: false, message: `Network error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gmailAppPasswordSteps = [
    'Go to your Google Account settings',
    'Click Security → 2-Step Verification (enable if not already)',
    'Go back to Security → App passwords',
    'Select app: Mail, device: Other (Custom name)',
    'Name it "TaskTracker" and click Generate',
    'Copy the 16-character password',
    'Add to your .env file as SMTP_PASSWORD',
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">📧 Email Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Set up and test your email service (Nodemailer SMTP or Resend)
          </p>
        </div>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
            <CardDescription>Check your email service status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkConfig} disabled={configLoading} className="w-full">
              {configLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Check Configuration
                </>
              )}
            </Button>

            {config && (
              <div className="mt-4">
                <Alert className={config.configured ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}>
                  <AlertDescription>
                    <div className="flex items-start gap-2">
                      {config.configured ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold mb-2">{config.message}</p>
                        <div className="text-sm space-y-1">
                          <p><strong>SMTP Host:</strong> {config.config.host}</p>
                          <p><strong>SMTP Port:</strong> {config.config.port}</p>
                          <p><strong>SMTP User:</strong> {config.config.user}</p>
                          <p><strong>SMTP From:</strong> {config.config.from}</p>
                          <p><strong>Password Set:</strong> {config.config.passwordSet ? '✅ Yes' : '❌ No'}</p>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Email */}
        <Card>
          <CardHeader>
            <CardTitle>Send Test Email</CardTitle>
            <CardDescription>Verify your email configuration works</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button onClick={sendTestEmail} disabled={loading || !email} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Test Email
                </>
              )}
            </Button>

            {result && (
              <Alert className={result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                <AlertDescription className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <span className="flex-1">{result.message}</span>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Gmail App Password Guide */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Get Gmail App Password</CardTitle>
            <CardDescription>Step-by-step guide to generate your Gmail app password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {gmailAppPasswordSteps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm pt-0.5">{step}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://myaccount.google.com/apppasswords', '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Google App Passwords
              </Button>

              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-semibold mb-2">Add to your .env file:</p>
                <div className="relative">
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"
SMTP_FROM="noreply@tasktracker.com"
SMTP_SECURE="false"`}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`SMTP_HOST="smtp.gmail.com"\nSMTP_PORT="587"\nSMTP_USER="your-email@gmail.com"\nSMTP_PASSWORD="xxxx xxxx xxxx xxxx"\nSMTP_FROM="noreply@tasktracker.com"\nSMTP_SECURE="false"`)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Services */}
        <Card>
          <CardHeader>
            <CardTitle>Alternative Email Services</CardTitle>
            <CardDescription>Other email providers you can use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Resend (Already configured)</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Modern email API service - currently configured in your .env
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://resend.com', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Resend
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">SendGrid</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  12,000 free emails/month
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://sendgrid.com', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit SendGrid
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Mailgun</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  5,000 free emails/month
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://mailgun.com', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Mailgun
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
