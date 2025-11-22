import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  // Create demo user
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@tasktracker.com",
      password: hashedPassword,
      role: "USER",
      plan: "PRO",
      timezone: "America/New_York",
      theme: "SYSTEM",
    },
  });

  console.log("👤 Created demo user:", demoUser.email);

  // Create additional team members
  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@tasktracker.com",
      password: hashedPassword,
      role: "USER",
      plan: "PRO",
      image: "https://i.pravatar.cc/150?img=1",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@tasktracker.com",
      password: hashedPassword,
      role: "USER",
      plan: "FREE",
      image: "https://i.pravatar.cc/150?img=12",
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol Williams",
      email: "carol@tasktracker.com",
      password: hashedPassword,
      role: "USER",
      plan: "PRO",
      image: "https://i.pravatar.cc/150?img=5",
    },
  });

  const david = await prisma.user.create({
    data: {
      name: "David Brown",
      email: "david@tasktracker.com",
      password: hashedPassword,
      role: "USER",
      plan: "FREE",
      image: "https://i.pravatar.cc/150?img=13",
    },
  });

  console.log("👥 Created 4 additional team members");

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "My Workspace",
      slug: "my-workspace",
      description: "Default workspace for demo purposes",
      ownerId: demoUser.id,
    },
  });

  console.log("🏢 Created workspace:", workspace.name);

  // Add user as workspace member
  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: demoUser.id,
      role: "OWNER",
    },
  });

  // Add other team members to workspace
  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: alice.id, role: "ADMIN" },
      { workspaceId: workspace.id, userId: bob.id, role: "MEMBER" },
      { workspaceId: workspace.id, userId: carol.id, role: "MEMBER" },
      { workspaceId: workspace.id, userId: david.id, role: "MEMBER" },
    ],
  });

  console.log("👥 Added 5 members to workspace");

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        name: "Frontend",
        color: "#3B82F6",
        workspaceId: workspace.id,
      },
    }),
    prisma.tag.create({
      data: {
        name: "Backend",
        color: "#10B981",
        workspaceId: workspace.id,
      },
    }),
    prisma.tag.create({
      data: {
        name: "Bug",
        color: "#EF4444",
        workspaceId: workspace.id,
      },
    }),
    prisma.tag.create({
      data: {
        name: "Feature",
        color: "#8B5CF6",
        workspaceId: workspace.id,
      },
    }),
  ]);

  console.log("🏷️  Created", tags.length, "tags");

  // Create projects
  const webAppProject = await prisma.project.create({
    data: {
      name: "Web Application",
      description: "Main web application development",
      color: "#3B82F6",
      icon: "🚀",
      status: "ACTIVE",
      visibility: "WORKSPACE",
      workspaceId: workspace.id,
      ownerId: demoUser.id,
      startDate: new Date("2025-01-01"),
      dueDate: new Date("2025-12-31"),
    },
  });

  const mobileAppProject = await prisma.project.create({
    data: {
      name: "Mobile App",
      description: "iOS and Android mobile applications",
      color: "#10B981",
      icon: "📱",
      status: "ACTIVE",
      visibility: "WORKSPACE",
      workspaceId: workspace.id,
      ownerId: demoUser.id,
    },
  });

  console.log("📊 Created 2 projects");

  // Create tasks
  const tasks = [
    {
      title: "Set up Next.js project",
      description: "Initialize Next.js with TypeScript and configure ESLint",
      status: "DONE" as const,
      priority: "HIGH" as const,
      projectId: webAppProject.id,
      completedAt: new Date("2025-10-15"),
    },
    {
      title: "Design database schema",
      description: "Create comprehensive Prisma schema with all models",
      status: "DONE" as const,
      priority: "HIGH" as const,
      projectId: webAppProject.id,
      completedAt: new Date("2025-10-20"),
    },
    {
      title: "Implement authentication",
      description: "Add NextAuth.js with Google and GitHub OAuth",
      status: "IN_PROGRESS" as const,
      priority: "URGENT" as const,
      projectId: webAppProject.id,
      dueDate: new Date("2025-11-05"),
      estimatedTime: 480, // 8 hours
      actualTime: 240, // 4 hours so far
    },
    {
      title: "Build task management UI",
      description: "Create task list, kanban board, and detail views",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      projectId: webAppProject.id,
      dueDate: new Date("2025-11-10"),
      estimatedTime: 960, // 16 hours
    },
    {
      title: "Add real-time collaboration",
      description: "Implement WebSocket for real-time updates",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      projectId: webAppProject.id,
      dueDate: new Date("2025-11-20"),
      estimatedTime: 720, // 12 hours
    },
    {
      title: "Integrate Stripe payments",
      description: "Set up subscription plans and billing",
      status: "TODO" as const,
      priority: "HIGH" as const,
      projectId: webAppProject.id,
      dueDate: new Date("2025-11-15"),
    },
    {
      title: "Design mobile UI mockups",
      description: "Create Figma designs for iOS and Android",
      status: "IN_REVIEW" as const,
      priority: "MEDIUM" as const,
      projectId: mobileAppProject.id,
      dueDate: new Date("2025-11-08"),
    },
    {
      title: "Fix login bug",
      description: "Users are experiencing issues with OAuth login flow",
      status: "TODO" as const,
      priority: "URGENT" as const,
      projectId: webAppProject.id,
      dueDate: new Date("2025-11-01"),
    },
  ];

  const createdTasks = await Promise.all(
    tasks.map((task) =>
      prisma.task.create({
        data: {
          ...task,
          workspaceId: workspace.id,
          assigneeId: demoUser.id,
        },
      })
    )
  );

  console.log("✅ Created", createdTasks.length, "tasks");

  // Connect tags to tasks
  await prisma.task.update({
    where: { id: createdTasks[0].id },
    data: { tags: { connect: [{ id: tags[0].id }, { id: tags[3].id }] } },
  });

  await prisma.task.update({
    where: { id: createdTasks[1].id },
    data: { tags: { connect: [{ id: tags[1].id }] } },
  });

  await prisma.task.update({
    where: { id: createdTasks[7].id },
    data: { tags: { connect: [{ id: tags[2].id }] } },
  });

  console.log("🔗 Connected tags to tasks");

  // Create a subtask
  const subtask = await prisma.task.create({
    data: {
      title: "Configure OAuth providers",
      description: "Set up Google and GitHub OAuth apps",
      status: "DONE",
      priority: "MEDIUM",
      workspaceId: workspace.id,
      projectId: webAppProject.id,
      assigneeId: demoUser.id,
      parentId: createdTasks[2].id, // Subtask of "Implement authentication"
      completedAt: new Date(),
    },
  });

  console.log("📝 Created subtask");

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        content: "Started working on this. Setting up the NextAuth configuration.",
        taskId: createdTasks[2].id,
        authorId: demoUser.id,
      },
      {
        content: "The OAuth flow is working well. Need to add email/password auth next.",
        taskId: createdTasks[2].id,
        authorId: demoUser.id,
      },
      {
        content: "This is blocking the mobile app release. Let's prioritize!",
        taskId: createdTasks[7].id,
        authorId: demoUser.id,
      },
    ],
  });

  console.log("💬 Created comments");

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        action: "created",
        entity: "task",
        metadata: { taskTitle: createdTasks[2].title },
        taskId: createdTasks[2].id,
        userId: demoUser.id,
      },
      {
        action: "updated",
        entity: "task",
        metadata: { field: "status", from: "TODO", to: "IN_PROGRESS" },
        taskId: createdTasks[2].id,
        userId: demoUser.id,
      },
      {
        action: "completed",
        entity: "task",
        metadata: { taskTitle: createdTasks[0].title },
        taskId: createdTasks[0].id,
        userId: demoUser.id,
      },
    ],
  });

  console.log("📋 Created activity logs");

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        title: "Task assigned",
        message: "You've been assigned to 'Implement authentication'",
        type: "TASK_ASSIGNED",
        link: `/tasks/${createdTasks[2].id}`,
        userId: demoUser.id,
        read: false,
      },
      {
        title: "Task due soon",
        message: "'Fix login bug' is due tomorrow",
        type: "TASK_DUE_SOON",
        link: `/tasks/${createdTasks[7].id}`,
        userId: demoUser.id,
        read: false,
      },
      {
        title: "Comment added",
        message: "New comment on 'Implement authentication'",
        type: "COMMENT_ADDED",
        link: `/tasks/${createdTasks[2].id}`,
        userId: demoUser.id,
        read: true,
      },
    ],
  });

  console.log("🔔 Created notifications");

  // Create some demo direct messages
  await prisma.message.createMany({
    data: [
      {
        content: "Hey! Welcome to the team! 👋",
        senderId: alice.id,
        receiverId: demoUser.id,
        messageType: "DIRECT",
        read: false,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        content: "Thanks! Excited to be here! How are things going?",
        senderId: demoUser.id,
        receiverId: alice.id,
        messageType: "DIRECT",
        read: true,
        createdAt: new Date(Date.now() - 3000000), // 50 minutes ago
      },
      {
        content: "Great! We're making good progress on the web app. Let me know if you need any help getting set up.",
        senderId: alice.id,
        receiverId: demoUser.id,
        messageType: "DIRECT",
        read: false,
        createdAt: new Date(Date.now() - 2400000), // 40 minutes ago
      },
      {
        content: "Hi there! Do you have time for a quick call about the authentication task?",
        senderId: bob.id,
        receiverId: demoUser.id,
        messageType: "DIRECT",
        read: false,
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
      },
      {
        content: "Sure! When works for you?",
        senderId: demoUser.id,
        receiverId: bob.id,
        messageType: "DIRECT",
        read: true,
        createdAt: new Date(Date.now() - 1200000), // 20 minutes ago
      },
      {
        content: "How about in 10 minutes?",
        senderId: bob.id,
        receiverId: demoUser.id,
        messageType: "DIRECT",
        read: false,
        createdAt: new Date(Date.now() - 600000), // 10 minutes ago
      },
      {
        content: "Hey! Just wanted to say the new features look amazing! 🚀",
        senderId: carol.id,
        receiverId: demoUser.id,
        messageType: "DIRECT",
        read: false,
        createdAt: new Date(Date.now() - 300000), // 5 minutes ago
      },
    ],
  });

  console.log("💬 Created demo direct messages");

  console.log("\n✨ Seed completed successfully!");
  console.log("\n📧 Demo credentials:");
  console.log("   Email: demo@tasktracker.com");
  console.log("   Password: password123");
  console.log("\n👥 Additional users (all use password: password123):");
  console.log("   - alice@tasktracker.com (Alice Johnson)");
  console.log("   - bob@tasktracker.com (Bob Smith)");
  console.log("   - carol@tasktracker.com (Carol Williams)");
  console.log("   - david@tasktracker.com (David Brown)");
  console.log("\n🚀 You can now run: npm run dev");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
