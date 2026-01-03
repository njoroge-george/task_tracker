'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { permissions } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  UserPlus,
  Mail,
  Crown,
  Shield,
  User,
  Eye,
  MoreVertical,
  Trash2,
  RefreshCw,
  Loader2,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Member {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  invitedByUser: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
  VIEWER: Eye,
};

const roleColors = {
  OWNER: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
  ADMIN: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
  MEMBER: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
  VIEWER: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400',
};

const statusColors = {
  PENDING: 'text-orange-600 border-orange-600 bg-orange-50 dark:bg-orange-900/20',
  ACCEPTED: 'text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20',
  DECLINED: 'text-red-600 border-red-600 bg-red-50 dark:bg-red-900/20',
  EXPIRED: 'text-gray-600 border-gray-600 bg-gray-50 dark:bg-gray-900/20',
};

export default function TeamManagementPage() {
  const { currentWorkspace, userRole, canInvite, canManageMembers } = useWorkspace();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('MEMBER');
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get current workspace (first workspace for now)
      const workspacesRes = await fetch('/api/workspaces');
      const workspacesData = await workspacesRes.json();
      
      if (workspacesData.workspaces && workspacesData.workspaces.length > 0) {
        const workspaceId = workspacesData.workspaces[0].id;
        setCurrentWorkspaceId(workspaceId);

        // Fetch members and invitations
        const [membersRes, invitationsRes] = await Promise.all([
          fetch(`/api/workspaces/${workspaceId}/members`),
          fetch(`/api/workspaces/${workspaceId}/invite`),
        ]);

        const membersData = await membersRes.json();
        const invitationsData = await invitationsRes.json();

        if (membersRes.ok) setMembers(membersData.members || []);
        if (invitationsRes.ok) setInvitations(invitationsData.invitations || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !currentWorkspaceId) return;

    setInviting(true);
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspaceId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (response.ok) {
        setInviteDialogOpen(false);
        setInviteEmail('');
        setInviteRole('MEMBER');
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!currentWorkspaceId) return;

    try {
      const response = await fetch(
        `/api/workspaces/${currentWorkspaceId}/invite?invitationId=${invitationId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel invitation');
      }
    } catch (error) {
      console.error('Error canceling invitation:', error);
      alert('Failed to cancel invitation');
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    if (!currentWorkspaceId) return;

    setChangingRole(memberId);
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspaceId}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          role: newRole,
        }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to change role');
      }
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Failed to change role');
    } finally {
      setChangingRole(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentWorkspaceId) return;

    setRemovingMember(memberId);
    try {
      const response = await fetch(
        `/api/workspaces/${currentWorkspaceId}/members?memberId=${memberId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    } finally {
      setRemovingMember(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your workspace members and invitations
        </p>
      </div>

      {/* Members Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members ({members.length})</CardTitle>
              <CardDescription>People who have access to this workspace</CardDescription>
            </div>
            {canInvite && (
              <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => {
              const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.user.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                        {(member.user.name || member.user.email)
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.user.name || member.user.email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={`gap-1 ${roleColors[member.role as keyof typeof roleColors]}`}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {member.role}
                    </Badge>

                    {member.role !== 'OWNER' && canManageMembers && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(member.id, 'ADMIN')}
                            disabled={member.role === 'ADMIN' || changingRole === member.id}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(member.id, 'MEMBER')}
                            disabled={member.role === 'MEMBER' || changingRole === member.id}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(member.id, 'VIEWER')}
                            disabled={member.role === 'VIEWER' || changingRole === member.id}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Make Viewer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {userRole === 'OWNER' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(member.id, 'OWNER')}
                                className="text-yellow-600 dark:text-yellow-400"
                              >
                                <Crown className="mr-2 h-4 w-4" />
                                Transfer Ownership
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={removingMember === member.id}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invitations Section */}
      {invitations.length > 0 && (() => {
        const pendingInvitations = invitations.filter(inv => inv.status === 'PENDING');
        const processedInvitations = invitations.filter(inv => inv.status !== 'PENDING');
        
        return (
          <Card>
            <CardHeader>
              <CardTitle>
                Invitations ({invitations.length})
                {pendingInvitations.length > 0 && (
                  <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                    {pendingInvitations.length} pending
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Manage workspace invitations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pending invitations first */}
                {pendingInvitations.map((invitation) => {
                  const RoleIcon = roleIcons[invitation.role as keyof typeof roleIcons];
                  const isExpired = new Date(invitation.expiresAt) < new Date();
                  
                  return (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-700/50 bg-orange-50/50 dark:bg-orange-900/10 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-800/30 flex items-center justify-center">
                          <Mail className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {invitation.email}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Invited by {invitation.invitedByUser.name || invitation.invitedByUser.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {isExpired ? (
                              <span className="text-red-500">Expired</span>
                            ) : (
                              <>
                                Expires{' '}
                                {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={`gap-1 ${roleColors[invitation.role as keyof typeof roleColors]}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {invitation.role}
                        </Badge>
                        <Badge variant="outline" className={statusColors[invitation.status as keyof typeof statusColors]}>
                          {invitation.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {/* Processed invitations (accepted, declined, expired) */}
                {processedInvitations.length > 0 && pendingInvitations.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
                )}
                {processedInvitations.map((invitation) => {
                  const RoleIcon = roleIcons[invitation.role as keyof typeof roleIcons];
                  const statusColor = statusColors[invitation.status as keyof typeof statusColors] || statusColors.PENDING;
                  
                  return (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors opacity-75"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Mail className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {invitation.email}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Invited by {invitation.invitedByUser.name || invitation.invitedByUser.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {invitation.status === 'ACCEPTED' && 'Joined the workspace'}
                            {invitation.status === 'DECLINED' && 'Invitation declined'}
                            {invitation.status === 'EXPIRED' && 'Invitation expired'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={`gap-1 ${roleColors[invitation.role as keyof typeof roleColors]}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {invitation.role}
                        </Badge>
                        <Badge variant="outline" className={statusColor}>
                          {invitation.status}
                        </Badge>
                        {/* Only show delete for processed invitations to clean up */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Remove from list"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="bg-card border-2 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Invite Team Member</DialogTitle>
            <DialogDescription className="text-secondary">
              Send an invitation to join your workspace. They'll receive an email with a link to accept.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-primary">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviting}
                className="bg-input border-default text-primary placeholder:text-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-primary">Role *</Label>
              <Select value={inviteRole} onValueChange={setInviteRole} disabled={inviting}>
                <SelectTrigger className="bg-input border-default">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-default">
                  <SelectItem value="VIEWER">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Viewer</p>
                        <p className="text-xs text-gray-500">Can view tasks and projects</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="MEMBER">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Member</p>
                        <p className="text-xs text-gray-500">Can create and edit tasks</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Admin</p>
                        <p className="text-xs text-gray-500">Can manage members and settings</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)} disabled={inviting}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
              {inviting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
