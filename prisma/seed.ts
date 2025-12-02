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

  // Helper function to get random date in past N days
  const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const randomUser = () => [demoUser, alice, bob, carol, david][Math.floor(Math.random() * 5)];

  // Create comprehensive tasks with varied dates for analytics
  const tasks = [
    // COMPLETED TASKS (Last 30 days)
    ...Array.from({ length: 45 }, (_, i) => ({
      title: `Completed Task ${i + 1}`,
      description: `Task completed ${30 - (i % 30)} days ago`,
      status: "DONE" as const,
      priority: ["LOW", "MEDIUM", "HIGH", "URGENT"][Math.floor(Math.random() * 4)] as any,
      projectId: i % 2 === 0 ? webAppProject.id : mobileAppProject.id,
      assigneeId: randomUser().id,
      createdAt: daysAgo(35 + (i % 30)),
      completedAt: daysAgo(30 - (i % 30)),
      dueDate: daysAgo(28 - (i % 30)),
      estimatedTime: 120 + Math.floor(Math.random() * 360),
      actualTime: 100 + Math.floor(Math.random() * 300),
    })),

    // IN PROGRESS TASKS
    ...Array.from({ length: 15 }, (_, i) => ({
      title: `In Progress Task ${i + 1}`,
      description: `Currently being worked on`,
      status: "IN_PROGRESS" as const,
      priority: ["MEDIUM", "HIGH", "URGENT"][Math.floor(Math.random() * 3)] as any,
      projectId: i % 2 === 0 ? webAppProject.id : mobileAppProject.id,
      assigneeId: randomUser().id,
      createdAt: daysAgo(5 + i),
      dueDate: new Date(Date.now() + (5 + i) * 24 * 60 * 60 * 1000),
      estimatedTime: 240 + Math.floor(Math.random() * 480),
      actualTime: 100 + Math.floor(Math.random() * 200),
    })),

    // TODO TASKS
    ...Array.from({ length: 20 }, (_, i) => ({
      title: `Todo Task ${i + 1}`,
      description: `Waiting to be started`,
      status: "TODO" as const,
      priority: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)] as any,
      projectId: i % 2 === 0 ? webAppProject.id : mobileAppProject.id,
      assigneeId: randomUser().id,
      createdAt: daysAgo(3 + (i % 10)),
      dueDate: new Date(Date.now() + (10 + i) * 24 * 60 * 60 * 1000),
      estimatedTime: 120 + Math.floor(Math.random() * 360),
    })),

    // OVERDUE TASKS (for drama!)
    ...Array.from({ length: 5 }, (_, i) => ({
      title: `Overdue Task ${i + 1}`,
      description: `This task is overdue!`,
      status: "TODO" as const,
      priority: "URGENT" as const,
      projectId: webAppProject.id,
      assigneeId: randomUser().id,
      createdAt: daysAgo(15 + i),
      dueDate: daysAgo(3 + i),
      estimatedTime: 240,
    })),

    // IN REVIEW TASKS
    ...Array.from({ length: 8 }, (_, i) => ({
      title: `In Review Task ${i + 1}`,
      description: `Pending review`,
      status: "IN_REVIEW" as const,
      priority: ["MEDIUM", "HIGH"][Math.floor(Math.random() * 2)] as any,
      projectId: i % 2 === 0 ? webAppProject.id : mobileAppProject.id,
      assigneeId: randomUser().id,
      createdAt: daysAgo(7 + i),
      dueDate: new Date(Date.now() + (3 + i) * 24 * 60 * 60 * 1000),
      estimatedTime: 180 + Math.floor(Math.random() * 300),
    })),

    // Specific important tasks
    {
      title: "Set up Next.js project",
      description: "Initialize Next.js with TypeScript and configure ESLint",
      status: "DONE" as const,
      priority: "HIGH" as const,
      projectId: webAppProject.id,
      assigneeId: demoUser.id,
      createdAt: daysAgo(35),
      completedAt: daysAgo(33),
      dueDate: daysAgo(32),
    },
    {
      title: "Implement authentication",
      description: "Add NextAuth.js with Google and GitHub OAuth",
      status: "IN_PROGRESS" as const,
      priority: "URGENT" as const,
      projectId: webAppProject.id,
      assigneeId: alice.id,
      createdAt: daysAgo(10),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      estimatedTime: 480,
      actualTime: 240,
    },
    {
      title: "Build Analytics Dashboard",
      description: "Create comprehensive analytics with charts",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      projectId: webAppProject.id,
      assigneeId: demoUser.id,
      createdAt: daysAgo(3),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedTime: 960,
      actualTime: 480,
    },
  ];

  const createdTasks = await Promise.all(
    tasks.map((task) =>
      prisma.task.create({
        data: {
          ...task,
          workspaceId: workspace.id,
        },
      })
    )
  );

  console.log("✅ Created", createdTasks.length, "tasks across all statuses and dates");

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
