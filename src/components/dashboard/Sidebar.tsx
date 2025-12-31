"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import { useSidebar } from "@/contexts/SidebarContext";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  CreditCard,
  FolderKanban,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic,
  MessageCircle,
  MessageSquare,
  PlusCircle,
  Sparkles,
  Users,
  X,
  Cog,
} from "lucide-react";
import {
  alpha,
  useTheme,
} from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Fab,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

type NavItem = {
  name: string;
  href: string;
  Icon: LucideIcon;
  badge?: string;
  adminOnly?: boolean;
};

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { name: "Activity", href: "/dashboard/activity", Icon: Activity },
  { name: "My Tasks", href: "/dashboard/tasks", Icon: CheckSquare },
  { name: "Projects", href: "/dashboard/projects", Icon: FolderKanban },
  { name: "Discussions", href: "/dashboard/discussions", Icon: MessageSquare },
  { name: "Playground", href: "/dashboard/playground", Icon: Sparkles },
  { name: "Board", href: "/dashboard/board", Icon: KanbanSquare },
  { name: "Calendar", href: "/dashboard/calendar", Icon: CalendarDays },
  { name: "Messages", href: "/dashboard/messages", Icon: MessageCircle },
  { name: "Voice Rooms", href: "/dashboard/rooms", Icon: Mic },
  { name: "Analytics", href: "/dashboard/analytics", Icon: BarChart3 },
  { name: "Team", href: "/dashboard/team", Icon: Users },
  { name: "Admin Payments", href: "/dashboard/admin/payments", Icon: CreditCard, adminOnly: true },
];

const drawerWidth = 280;
const collapsedWidth = 88;
const expandedWidth = 272;

export default function Sidebar() {
  const pathname = usePathname();
  const theme = useTheme();
  const { collapsed, setCollapsed } = useSidebar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const isLgDown = useMediaQuery(theme.breakpoints.down("lg"));

  const filteredNavigation = useMemo(
    () =>
      navigation.filter((item) =>
        item.adminOnly ? session?.user?.role === "ADMIN" : true
      ),
    [session]
  );

  const dividerColor = alpha(
    theme.palette.mode === "dark"
      ? theme.palette.common.white
      : theme.palette.common.black,
    theme.palette.mode === "dark" ? 0.12 : 0.08
  );

  const sidebarBackground = useMemo(() => {
    if (theme.palette.mode === "dark") {
      return `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(
        theme.palette.background.paper,
        0.95
      )} 40%, ${theme.palette.background.default} 100%)`;
    }
    return `linear-gradient(180deg, ${alpha(
      theme.palette.primary.dark,
      0.18
    )} 0%, ${theme.palette.background.default} 20%, ${theme.palette.background.default} 80%, ${alpha(
      theme.palette.primary.dark,
      0.18
    )} 100%)`;
  }, [theme]);

  const activeGradient = useMemo(
    () =>
      theme.palette.mode === "dark"
        ? `linear-gradient(135deg, ${alpha(
            theme.palette.primary.dark,
            0.75
          )}, ${alpha(theme.palette.primary.main, 0.35)})`
        : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    [theme]
  );

  const hoverBackground = useMemo(
    () =>
      theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.15)
        : alpha(theme.palette.primary.main, 0.08),
    [theme]
  );

  const isActive = (href: string) => pathname === href;

  const renderNavItem = (
    item: NavItem,
    options: { collapsed: boolean; onSelect?: () => void }
  ) => {
    const { collapsed } = options;
    const active = isActive(item.href);

    const content = (
      <Box
        component={Link}
        href={item.href}
        onClick={options.onSelect}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: collapsed ? 0 : 1.5,
          px: collapsed ? 1.25 : 2,
          py: 1.25,
          borderRadius: 2,
          textDecoration: "none",
          position: "relative",
          color: active
            ? theme.palette.primary.contrastText
            : theme.palette.text.secondary,
          backgroundImage: active ? activeGradient : "none",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundImage: active ? activeGradient : "none",
            backgroundColor: active ? undefined : hoverBackground,
            color: theme.palette.mode === "dark"
              ? theme.palette.primary.light
              : theme.palette.primary.dark,
            boxShadow: active ? theme.shadows[6] : theme.shadows[2],
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={collapsed ? 0 : 1.5}
          sx={{ color: "inherit" }}
        >
          <item.Icon size={20} strokeWidth={2.2} />
          {!collapsed && (
            <Typography variant="body2" fontWeight={500}>
              {item.name}
            </Typography>
          )}
        </Stack>
        {!collapsed && item.badge && (
          <Chip
            label={item.badge}
            size="small"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.dark,
              backgroundColor: alpha(theme.palette.primary.light, 0.3),
            }}
          />
        )}
        {collapsed && item.badge && (
          <Box
            sx={{
              position: "absolute",
              top: 6,
              right: 8,
              fontSize: 10,
              fontWeight: 700,
              px: 0.75,
              py: 0.25,
              borderRadius: 999,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            }}
          >
            {item.badge}
          </Box>
        )}
      </Box>
    );

    if (!collapsed) return content;

    return (
      <Tooltip
        key={item.name}
        title={
          item.badge ? `${item.name} (${item.badge})` : item.name
        }
        placement="right"
        arrow
      >
        <Box component="span" sx={{ display: "block" }}>
          {content}
        </Box>
      </Tooltip>
    );
  };

  const renderBottomSection = (collapsedView: boolean, onSelect?: () => void) => {
    if (collapsedView) {
      return (
        <Stack spacing={1.5} alignItems="center">
          <Tooltip title="New Project" placement="right">
            <IconButton
              color="primary"
              onClick={onSelect}
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15) }}
            >
              <PlusCircle size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings" placement="right">
            <IconButton
              component={Link}
              href="/dashboard/settings"
              color="primary"
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15) }}
              onClick={onSelect}
            >
              <Cog size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout" placement="right">
            <IconButton
              color="error"
              onClick={() => signOut({ callbackUrl: "/" })}
              sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
            >
              <LogOut size={18} />
            </IconButton>
          </Tooltip>
          <ThemeToggle />
        </Stack>
      );
    }

    return (
      <Stack spacing={1.5}>
        <Button
          variant="contained"
          startIcon={<PlusCircle size={18} />}
          sx={{ borderRadius: 2 }}
        >
          New Project
        </Button>
        <Button
          component={Link}
          href="/dashboard/settings"
          variant="outlined"
          startIcon={<Cog size={18} />}
          sx={{ borderRadius: 2 }}
          onClick={onSelect}
        >
          Settings
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogOut size={18} />}
          sx={{ borderRadius: 2 }}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Logout
        </Button>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pt: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Theme
          </Typography>
          <ThemeToggle />
        </Stack>
      </Stack>
    );
  };

  const sidebarContent = (collapsedView: boolean, onSelect?: () => void) => (
    <Stack sx={{ height: "100%" }}>
      <Box
        sx={{
          px: collapsedView ? 1 : 2,
          py: 2,
          borderBottom: `1px solid ${dividerColor}`,
        }}
      >
        <WorkspaceSwitcher collapsed={collapsedView} />
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: collapsedView ? 1 : 2,
          py: 3,
        }}
      >
        <Stack spacing={1}>
          {filteredNavigation.map((item) => (
            <Box key={item.name}>
              {renderNavItem(item, {
                collapsed: collapsedView,
                onSelect,
              })}
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ borderColor: dividerColor }} />

      <Box sx={{ px: collapsedView ? 1 : 2, py: 2 }}>
        {renderBottomSection(collapsedView, onSelect)}
      </Box>
    </Stack>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Fab
        color="primary"
        onClick={() => setMobileMenuOpen((open) => !open)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: theme.zIndex.drawer + 2,
          display: { lg: "none", xs: "flex" },
        }}
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </Fab>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: drawerWidth,
            backgroundImage: sidebarBackground,
            borderRight: `1px solid ${dividerColor}`,
            pt: theme.spacing(8),
          },
        }}
      >
        {sidebarContent(false, () => setMobileMenuOpen(false))}
      </Drawer>

      {/* Desktop sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", lg: "flex" },
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          flexDirection: "column",
          width: collapsed ? collapsedWidth : expandedWidth,
          pt: theme.spacing(8),
          backgroundImage: sidebarBackground,
          borderRight: `1px solid ${dividerColor}`,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 0 35px rgba(2,6,23,0.65)"
              : theme.shadows[10],
          transition: "width 0.3s ease",
          zIndex: theme.zIndex.appBar - 1,
        }}
      >
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          sx={{
            position: "absolute",
            top: theme.spacing(12),
            right: -18,
            borderRadius: "50%",
            boxShadow: theme.shadows[4],
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            transform: collapsed ? "rotate(180deg)" : "none",
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={18} />
        </IconButton>

        {sidebarContent(collapsed)}
      </Box>

      {/* Spacer for layout when not mobile */}
      {!isLgDown && (
        <Box sx={{ width: collapsed ? collapsedWidth : expandedWidth, flexShrink: 0 }} />
      )}
    </>
  );
}
