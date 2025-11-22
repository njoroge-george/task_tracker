"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Chip,
  Button,
  Card,
  CardHeader,
  CardContent,
  Tabs,
  Tab,
  Divider,
  LinearProgress,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Calendar,
  Clock,
  User as UserIcon,
  Tag as TagIcon,
  Paperclip,
  CheckSquare,
  ArrowLeft,
  Edit,
  Trash,
  Send,
} from "lucide-react";
import { useRealtime } from "@/contexts/RealtimeContext";
import PresenceIndicator from "@/components/realtime/PresenceIndicator";
import TypingIndicator from "@/components/realtime/TypingIndicator";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  startDate: Date | null;
  completedAt: Date | null;
  estimatedTime: number | null;
  actualTime: number | null;
  assignee: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  project: { id: string; name: string; color: string | null; description: string | null } | null;
  tags: Array<{ id: string; name: string; color: string | null }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: { id: string; name: string | null; email: string | null; image: string | null };
  }>;
  attachments: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    createdAt: Date;
    uploader: { id: string; name: string | null; email: string | null };
  }>;
  subtasks: Array<{ id: string; title: string; status: string; completedAt: Date | null; createdAt: Date }>;
  activityLogs: Array<{
    id: string;
    action: string;
    entity: string;
    metadata: any;
    createdAt: Date;
    user: { id: string; name: string | null; email: string | null; image: string | null };
  }>;
  createdAt: Date;
  updatedAt: Date;
};

type Member = { id: string; name: string | null; email: string | null; image: string | null };
type Project = { id: string; name: string; color: string | null };
type TagType = { id: string; name: string; color: string | null };

type Props = { task: Task; currentUserId: string; members: Member[]; projects: Project[]; availableTags: TagType[] };

const statusOptions = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

function statusChipColor(status: string): "default" | "info" | "warning" | "success" {
  switch (status) {
    case "IN_PROGRESS":
      return "info";
    case "IN_REVIEW":
      return "warning";
    case "DONE":
      return "success";
    default:
      return "default";
  }
}

function priorityChipColor(priority: string): "default" | "info" | "warning" | "error" {
  switch (priority) {
    case "MEDIUM":
      return "info";
    case "HIGH":
      return "warning";
    case "URGENT":
      return "error";
    default:
      return "default";
  }
}

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ mt: 2 }}>
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

export default function TaskDetailView({ task, currentUserId, members }: Props) {
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { joinTask, leaveTask, emitTaskUpdate, emitComment, onTaskUpdate, onCommentAdded, startTyping, stopTyping } = useRealtime();

  const completedSubtasks = task.subtasks.filter((s) => !!s.completedAt).length;
  const subtaskProgress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;

  // Join task room on mount
  useEffect(() => {
    joinTask(task.id);
    return () => {
      leaveTask(task.id);
    };
  }, [task.id, joinTask, leaveTask]);

  // Listen for real-time updates
  useEffect(() => {
    const unsubscribeTask = onTaskUpdate((data) => {
      if (data.taskId === task.id && data.userId !== currentUserId) {
        // Refresh the page to show updates
        router.refresh();
      }
    });

    const unsubscribeComment = onCommentAdded((data) => {
      if (data.userId !== currentUserId) {
        router.refresh();
      }
    });

    return () => {
      unsubscribeTask();
      unsubscribeComment();
    };
  }, [task.id, currentUserId, onTaskUpdate, onCommentAdded, router]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

  const handlePatch = async (payload: object) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      
      // Emit real-time update
      emitTaskUpdate({
        taskId: task.id,
        workspaceId: task.project?.id, // You might need to pass workspaceId as prop
        projectId: task.project?.id,
        update: payload,
      });
      
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update task");
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
    if (e.target.value.length > 0) {
      startTyping(task.id, members.find(m => m.id === currentUserId)?.name || 'Someone');
    } else {
      stopTyping(task.id);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    stopTyping(task.id);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      
      // Emit real-time comment notification
      emitComment({
        taskId: task.id,
        comment: newComment,
      });
      
      setNewComment("");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const overdue = task.dueDate ? new Date(task.dueDate).getTime() < Date.now() && task.status !== "DONE" : false;

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button component={Link} href="/dashboard/tasks" startIcon={<ArrowLeft />} size="small" variant="outlined">
          Back to Tasks
        </Button>
        <Stack direction="row" spacing={2} alignItems="center">
          <PresenceIndicator taskId={task.id} />
          <Button startIcon={<Edit />} size="small" variant="outlined">
            Edit
          </Button>
          <Button startIcon={<Trash />} size="small" variant="contained" color="error">
            Delete
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '2fr 1fr',
          },
          gap: 3,
        }}
      >
        {/* Left Column */}
        <Box sx={{ display: "grid", gap: 3 }}>
          {/* Task Header */}
          <Card>
            <CardHeader
              title={
                <Box>
                  {task.project && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: task.project.color || "gray" }} />
                      <Typography variant="body2" color="text.secondary">
                        {task.project.name}
                      </Typography>
                    </Stack>
                  )}
                  <Typography variant="h5" sx={{ mb: task.description ? 1 : 0 }}>
                    {task.title}
                  </Typography>
                  {task.description && <Typography variant="body1">{task.description}</Typography>}
                </Box>
              }
              action={
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={task.status.replace("_", " ")}
                    color={statusChipColor(task.status)}
                    variant={statusChipColor(task.status) === "default" ? "outlined" : "filled"}
                    size="small"
                  />
                  <Chip
                    label={task.priority}
                    color={priorityChipColor(task.priority)}
                    variant={priorityChipColor(task.priority) === "default" ? "outlined" : "filled"}
                    size="small"
                  />
                </Stack>
              }
            />
          </Card>

          {/* Tabs */}
          <Box sx={{ display: "grid", gap: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
              <Tab label="Details" />
              <Tab label={`Comments (${task.comments.length})`} />
              <Tab label={`Activity (${task.activityLogs.length})`} />
            </Tabs>

            {/* Details */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3}>
                {/* Subtasks */}
                {task.subtasks.length > 0 && (
                  <Card>
                    <CardHeader
                      title={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckSquare />
                          <Typography variant="subtitle1">
                            Subtasks ({completedSubtasks}/{task.subtasks.length})
                          </Typography>
                        </Stack>
                      }
                      subheader={<LinearProgress variant="determinate" value={subtaskProgress} sx={{ height: 8, borderRadius: 1, mt: 1 }} />}
                    />
                    <CardContent>
                      <List disablePadding>
                        {task.subtasks.map((sub) => (
                          <ListItem key={sub.id} dense sx={{ borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}>
                            <ListItemIcon>
                              <Checkbox checked={!!sub.completedAt} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ textDecoration: sub.completedAt ? "line-through" : "none" }}>
                                  {sub.title}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                )}

                {/* Attachments */}
                {task.attachments.length > 0 && (
                  <Card>
                    <CardHeader
                      title={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Paperclip />
                          <Typography variant="subtitle1">Attachments ({task.attachments.length})</Typography>
                        </Stack>
                      }
                    />
                    <CardContent sx={{ display: "grid", gap: 2 }}>
                      {task.attachments.map((att) => (
                        <Box
                          key={att.id}
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: '1fr',
                              sm: '2fr 1fr',
                            },
                            gap: 2,
                            p: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            alignItems: "center"
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Paperclip size={16} />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{att.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(att.size / 1024).toFixed(1)} KB • {att.uploader.name}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                            <Button variant="outlined" size="small" href={att.url} target="_blank" rel="noopener noreferrer">
                              Download
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Time Tracking */}
                <Card>
                  <CardHeader
                    title={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Clock />
                        <Typography variant="subtitle1">Time Tracking</Typography>
                      </Stack>
                    }
                  />
                  <CardContent>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">Estimated Hours</Typography>
                        <Typography variant="h5">{task.estimatedTime ? (task.estimatedTime / 60).toFixed(1) : "—"}h</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Actual Hours</Typography>
                        <Typography variant="h5">{task.actualTime ? (task.actualTime / 60).toFixed(1) : "—"}h</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Stack>
            </TabPanel>

            {/* Comments */}
            <TabPanel value={tabValue} index={1}>
              <Card>
                <CardContent sx={{ display: "grid", gap: 3 }}>
                  <TextField
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={handleCommentChange}
                    multiline
                    minRows={3}
                    fullWidth
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      onClick={handleSubmitComment}
                      disabled={isSubmittingComment || !newComment.trim()}
                      startIcon={<Send />}
                      size="small"
                      variant="contained"
                    >
                      Post Comment
                    </Button>
                  </Box>

                  <TypingIndicator />

                  {task.comments.length === 0 ? (
                    <Typography align="center" color="text.secondary">No comments yet</Typography>
                  ) : (
                    <Stack spacing={2}>
                      {task.comments.map((comment) => (
                        <Stack key={comment.id} direction="row" spacing={1.5}>
                          <Avatar src={comment.author.image || undefined} sx={{ width: 32, height: 32 }}>
                            {(comment.author.name?.[0] || comment.author.email?.[0] || "?") as string}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" fontWeight={600}>{comment.author.name || comment.author.email}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comment.createdAt).toLocaleString()}
                              </Typography>
                            </Stack>
                            <Typography variant="body2">{comment.content}</Typography>
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Activity */}
            <TabPanel value={tabValue} index={2}>
              <Card>
                <CardContent sx={{ display: "grid", gap: 2 }}>
                  {task.activityLogs.length === 0 ? (
                    <Typography align="center" color="text.secondary">No activity yet</Typography>
                  ) : (
                    <Stack spacing={2}>
                      {task.activityLogs.map((log, idx) => (
                        <Box key={log.id}>
                          <Stack direction="row" spacing={1.5}>
                            <Avatar src={log.user.image || undefined} sx={{ width: 32, height: 32 }}>
                              {(log.user.name?.[0] || log.user.email?.[0] || "?") as string}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2">
                                <Typography component="span" fontWeight={600} variant="body2">
                                  {log.user.name || log.user.email}
                                </Typography>{" "}
                                {log.action} {log.entity}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(log.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          </Stack>
                          {idx < task.activityLogs.length - 1 && <Divider sx={{ mt: 2 }} />}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
          </Box>
        </Box>

        {/* Right Column */}
        <Box sx={{ display: "grid", gap: 2 }}>
          {/* Status */}
          <Card>
            <CardHeader title="Status" />
            <CardContent>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={task.status} onChange={(e) => handlePatch({ status: e.target.value })}>
                  {statusOptions.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Priority */}
          <Card>
            <CardHeader title="Priority" />
            <CardContent>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select value={task.priority} onChange={(e) => handlePatch({ priority: e.target.value })}>
                  {priorityOptions.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Assignee */}
          <Card>
            <CardHeader
              title={
                <Stack direction="row" spacing={1} alignItems="center">
                  <UserIcon size={16} />
                  <Typography variant="subtitle2">Assignee</Typography>
                </Stack>
              }
            />
            <CardContent>
              <FormControl fullWidth size="small">
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={task.assignee?.id || ""}
                  onChange={(e) => handlePatch({ assigneeId: e.target.value })}
                  displayEmpty
                  renderValue={(value) => {
                    if (!value) return "Unassigned";
                    const m = members.find((mm) => mm.id === value);
                    return m?.name || m?.email || "Unassigned";
                  }}
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {members.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name || member.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {task.assignee && (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
                  <Avatar sx={{ width: 32, height: 32 }} src={task.assignee.image || undefined}>
                    {(task.assignee.name?.[0] || task.assignee.email?.[0] || "?") as string}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {task.assignee.name || task.assignee.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Assigned to this task
                    </Typography>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}