'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Search,
  Phone,
  DollarSign,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

interface Payment {
  id: string;
  reference: string;
  amount: number;
  plan: string;
  status: PaymentStatus;
  phoneNumber: string | null;
  transactionCode: string | null;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function AdminPaymentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'VERIFY' | 'REJECT'>('VERIFY');

  // Check if user is admin
  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
      } else {
        console.error('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchPayments();
    }
  }, [session]);

  const handleActionClick = (payment: Payment, action: 'VERIFY' | 'REJECT') => {
    setSelectedPayment(payment);
    setDialogAction(action);
    setAdminNotes(payment.notes || '');
    setShowDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedPayment) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action: dialogAction,
          notes: adminNotes,
        }),
      });

      if (response.ok) {
        // Immediately refresh the payments list
        await fetchPayments();
        
        // Force router refresh to update user's session/plan data immediately
        router.refresh();
        
        setShowDialog(false);
        setSelectedPayment(null);
        setAdminNotes('');
        
        console.log(`✅ Payment ${dialogAction === 'VERIFY' ? 'verified' : 'rejected'} - User upgraded immediately!`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phoneNumber?.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'ALL' || payment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, { color: string; icon: any }> = {
      PENDING: { color: 'bg-yellow-500', icon: Clock },
      VERIFIED: { color: 'bg-green-500', icon: CheckCircle2 },
      REJECTED: { color: 'bg-red-500', icon: XCircle },
      EXPIRED: { color: 'bg-gray-500', icon: XCircle },
    };

    const { color, icon: Icon } = variants[status];
    return (
      <Badge className={`${color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const stats = {
    pending: payments.filter(p => p.status === 'PENDING').length,
    verified: payments.filter(p => p.status === 'VERIFIED').length,
    rejected: payments.filter(p => p.status === 'REJECTED').length,
    total: payments.length,
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground mt-1">
            Verify and manage M-Pesa payments
          </p>
        </div>
        <Button onClick={fetchPayments} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, phone, or transaction code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading payments...</p>
          </CardContent>
        </Card>
      ) : filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No payments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Payment Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{payment.plan} Plan</h3>
                          {getStatusBadge(payment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Transaction: <span className="font-mono">{payment.reference}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          KES {payment.amount.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">{payment.paymentMethod}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{payment.user.name || 'No name'}</p>
                          <p className="text-muted-foreground">{payment.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p>{payment.phoneNumber || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Submitted</p>
                          <p className="text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {payment.verifiedAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Verified</p>
                            <p className="text-muted-foreground">
                              {new Date(payment.verifiedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {payment.notes && (
                      <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">Admin Notes</p>
                          <p className="text-sm text-muted-foreground">{payment.notes}</p>
                          {payment.verifiedBy && (
                            <p className="text-xs text-muted-foreground mt-1">
                              By: {payment.verifiedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {payment.status === 'PENDING' && (
                    <div className="flex lg:flex-col gap-2">
                      <Button
                        onClick={() => handleActionClick(payment, 'VERIFY')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                      <Button
                        onClick={() => handleActionClick(payment, 'REJECT')}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-2 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary text-xl">
              {dialogAction === 'VERIFY' ? 'Verify Payment' : 'Reject Payment'}
            </DialogTitle>
            <DialogDescription className="text-secondary">
              {dialogAction === 'VERIFY'
                ? 'Confirm that you have verified this M-Pesa transaction and the user will be upgraded.'
                : 'Confirm that you want to reject this payment. The user will be notified.'}
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 dark:bg-white/5 border border-default rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-primary">Transaction Code:</span>
                  <span className="text-sm font-mono text-secondary">{selectedPayment.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-primary">Amount:</span>
                  <span className="text-sm text-secondary">KES {selectedPayment.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-primary">Plan:</span>
                  <span className="text-sm text-secondary">{selectedPayment.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-primary">User:</span>
                  <span className="text-sm text-secondary">{selectedPayment.user.email}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-primary">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder={
                    dialogAction === 'VERIFY'
                      ? 'Add any verification notes...'
                      : 'Reason for rejection...'
                  }
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="bg-input border-default text-primary placeholder:text-secondary mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={actionLoading}
              className={
                dialogAction === 'VERIFY'
                  ? 'bg-green-600 hover:bg-green-700'
                  : ''
              }
              variant={dialogAction === 'REJECT' ? 'destructive' : 'default'}
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {dialogAction === 'VERIFY' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Verify Payment
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Payment
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
