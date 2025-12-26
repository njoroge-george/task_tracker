"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Activity,
  Bell,
  Check,
  ChevronDown,
  CreditCard,
  Home,
  LogOut,
  Menu as MenuIcon,
  Search,
  Settings,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

interface DashboardNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    plan?: string;
  };
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const theme = useTheme();
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const navBackground = useMemo(
    () =>
      theme.palette.mode === "dark"
        ? `linear-gradient(90deg, ${theme.palette.background.default} 0%, ${alpha(
            theme.palette.primary.dark,
            0.25
          )} 50%, ${theme.palette.background.default} 100%)`
        : `linear-gradient(90deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, ${
            theme.palette.background.default
          } 30%, ${theme.palette.background.default} 100%)`,
    [theme]
  );

  const dividerColor = alpha(
    theme.palette.mode === "dark"
      ? theme.palette.common.white
      : theme.palette.common.black,
    theme.palette.mode === "dark" ? 0.12 : 0.08
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/notifications");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadNotifications.map((notification) =>
          fetch(`/api/notifications/${notification.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundImage: navBackground,
          borderBottom: `1px solid ${dividerColor}`,
          color: theme.palette.text.primary,
          backdropFilter: "blur(18px)",
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, lg: 3 }, justifyContent: "space-between" }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              color="inherit"
              onClick={(event) => setMobileAnchor(event.currentTarget)}
              sx={{ display: { lg: "none" } }}
            >
              <MenuIcon size={20} />
            </IconButton>
            <Stack
              component={Link}
              href="/dashboard"
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ textDecoration: "none", color: "inherit" }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: theme.shadows[4],
                  color: theme.palette.primary.contrastText,
                }}
              >
                <Activity size={18} />
              </Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                TaskTracker
              </Typography>
            </Stack>
            <Button
              component={Link}
              href="/"
              startIcon={<Home size={16} />}
              sx={{
                display: { xs: "none", md: "inline-flex" },
                borderRadius: 2,
                textTransform: "none",
                color: theme.palette.text.primary,
              }}
            >
              Home
            </Button>
          </Stack>

          <Box
            sx={{
              flex: 1,
              maxWidth: 480,
              mx: { md: 4 },
              display: { xs: "none", md: "flex" },
            }}
          >
            <Paper
              component="form"
              onSubmit={(event) => event.preventDefault()}
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                px: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                border: `1px solid ${dividerColor}`,
              }}
              elevation={0}
            >
              <IconButton size="small">
                <Search size={18} />
              </IconButton>
              <InputBase
                placeholder="Search tasks, projects..."
                sx={{ ml: 1, flex: 1 }}
              />
            </Paper>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <ThemeToggle />
            <IconButton
              color="primary"
              onClick={(event) => setNotificationsAnchor(event.currentTarget)}
            >
              <Badge color="error" badgeContent={unreadCount > 9 ? "9+" : unreadCount || null}>
                <Bell size={20} />
              </Badge>
            </IconButton>
            <Button
              onClick={(event) => setUserAnchor(event.currentTarget)}
              endIcon={<ChevronDown size={16} />}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                color: theme.palette.text.primary,
              }}
            >
              <Avatar
                src={user.image || undefined}
                alt={user.name || "User"}
                sx={{ width: 32, height: 32, mr: 1 }}
              >
                {getInitials(user.name || user.email || "U")}
              </Avatar>
              <Typography variant="body2" sx={{ display: { xs: "none", md: "inline" } }}>
                {user.name || "User"}
              </Typography>
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Mobile menu */}
      <Menu
        anchorEl={mobileAnchor}
        open={Boolean(mobileAnchor)}
        onClose={() => setMobileAnchor(null)}
        PaperProps={{
          sx: {
            width: 220,
            mt: 1,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: theme.shadows[6],
          },
        }}
      >
        <MenuItem component={Link} href="/dashboard" onClick={() => setMobileAnchor(null)}>
          Dashboard
        </MenuItem>
        <MenuItem component={Link} href="/dashboard/settings" onClick={() => setMobileAnchor(null)}>
          Settings
        </MenuItem>
        <MenuItem component={Link} href="/dashboard/billing" onClick={() => setMobileAnchor(null)}>
          Billing
        </MenuItem>
      </Menu>

      {/* Notifications */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={() => setNotificationsAnchor(null)}
        PaperProps={{
          sx: {
            width: 360,
            mt: 1,
            borderRadius: 3,
            boxShadow: theme.shadows[8],
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle2">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" py={4} spacing={1}>
              <CircularProgress size={20} />
              <Typography variant="caption" color="text.secondary">
                Loading...
              </Typography>
            </Stack>
          ) : notifications.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" py={4} spacing={1}>
              <Bell size={32} opacity={0.5} />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Stack>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => {
                  if (!notification.read) markAsRead(notification.id);
                }}
                sx={{
                  alignItems: "flex-start",
                  gap: 1.5,
                  backgroundColor: !notification.read
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                }}
              >
                <Stack alignItems="center" spacing={0.5} sx={{ pt: 0.5 }}>
                  {!notification.read ? (
                    <Badge color="primary" variant="dot">
                      <Check size={16} opacity={0} />
                    </Badge>
                  ) : (
                    <Check size={16} opacity={0.3} />
                  )}
                </Stack>
                <Box>
                  <Typography variant="subtitle2">{notification.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Box>
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={userAnchor}
        open={Boolean(userAnchor)}
        onClose={() => setUserAnchor(null)}
        PaperProps={{
          sx: {
            width: 280,
            mt: 1,
            borderRadius: 3,
            boxShadow: theme.shadows[8],
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          {user.plan && (
            <Chip
              label={`${user.plan} Plan`}
              size="small"
              sx={{ mt: 1 }}
              color="primary"
            />
          )}
        </Box>
        <Divider />
        <MenuItem component={Link} href="/dashboard/settings" onClick={() => setUserAnchor(null)}>
          <Settings size={16} style={{ marginRight: 12 }} />
          Settings
        </MenuItem>
        <MenuItem component={Link} href="/dashboard/billing" onClick={() => setUserAnchor(null)}>
          <CreditCard size={16} style={{ marginRight: 12 }} />
          Billing
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          sx={{ color: theme.palette.error.main }}
        >
          <LogOut size={16} style={{ marginRight: 12 }} />
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}
