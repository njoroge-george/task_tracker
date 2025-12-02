/**
 * Plan Features & Restrictions
 * Defines what features are available for each plan tier
 */

export type PlanTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface PlanFeatures {
  // Project & Task Limits
  maxProjects: number;
  maxTasksPerProject: number;
  unlimitedTasks: boolean;
  unlimitedProjects: boolean;
  
  // Advanced Features
  advancedAnalytics: boolean;
  aiSuggestions: boolean;
  customWorkflows: boolean;
  exportData: boolean;
  apiIntegrations: boolean;
  
  // Collaboration
  screenSharing: boolean;
  videoMessages: boolean;
  voiceMessages: boolean;
  realTimeCollaboration: boolean;
  advancedPermissions: boolean;
  
  // Code Playground
  playgroundAccess: boolean;
  pythonExecution: boolean;
  livePreview: boolean;
  snippetSharing: boolean;
  
  // Support
  prioritySupport: boolean;
  dedicatedSupport: boolean;
  customTraining: boolean;
}

export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  FREE: {
    // Limits
    maxProjects: 5,
    maxTasksPerProject: 50,
    unlimitedTasks: false,
    unlimitedProjects: false,
    
    // Advanced Features
    advancedAnalytics: false,
    aiSuggestions: false,
    customWorkflows: false,
    exportData: false,
    apiIntegrations: false,
    
    // Collaboration
    screenSharing: false,
    videoMessages: false,
    voiceMessages: false,
    realTimeCollaboration: false,
    advancedPermissions: false,
    
    // Code Playground
    playgroundAccess: false,
    pythonExecution: false,
    livePreview: false,
    snippetSharing: false,
    
    // Support
    prioritySupport: false,
    dedicatedSupport: false,
    customTraining: false,
  },
  
  PRO: {
    // Limits
    maxProjects: Infinity,
    maxTasksPerProject: Infinity,
    unlimitedTasks: true,
    unlimitedProjects: true,
    
    // Advanced Features
    advancedAnalytics: true,
    aiSuggestions: true,
    customWorkflows: true,
    exportData: true,
    apiIntegrations: true,
    
    // Collaboration
    screenSharing: true,
    videoMessages: true,
    voiceMessages: true,
    realTimeCollaboration: false, // Enterprise only
    advancedPermissions: false, // Enterprise only
    
    // Code Playground
    playgroundAccess: true,
    pythonExecution: true,
    livePreview: true,
    snippetSharing: true,
    
    // Support
    prioritySupport: true,
    dedicatedSupport: false,
    customTraining: false,
  },
  
  ENTERPRISE: {
    // Limits
    maxProjects: Infinity,
    maxTasksPerProject: Infinity,
    unlimitedTasks: true,
    unlimitedProjects: true,
    
    // Advanced Features
    advancedAnalytics: true,
    aiSuggestions: true,
    customWorkflows: true,
    exportData: true,
    apiIntegrations: true,
    
    // Collaboration
    screenSharing: true,
    videoMessages: true,
    voiceMessages: true,
    realTimeCollaboration: true,
    advancedPermissions: true,
    
    // Code Playground
    playgroundAccess: true,
    pythonExecution: true,
    livePreview: true,
    snippetSharing: true,
    
    // Support
    prioritySupport: true,
    dedicatedSupport: true,
    customTraining: true,
  },
};

/**
 * Check if a plan has access to a specific feature
 */
export function hasFeature(plan: PlanTier | string | null | undefined, feature: keyof PlanFeatures): boolean {
  const planTier = (plan?.toUpperCase() || 'FREE') as PlanTier;
  const validPlan = ['FREE', 'PRO', 'ENTERPRISE'].includes(planTier) ? planTier : 'FREE';
  return PLAN_FEATURES[validPlan][feature] as boolean;
}

/**
 * Get all features for a plan
 */
export function getPlanFeatures(plan: PlanTier | string | null | undefined): PlanFeatures {
  const planTier = (plan?.toUpperCase() || 'FREE') as PlanTier;
  const validPlan = ['FREE', 'PRO', 'ENTERPRISE'].includes(planTier) ? planTier : 'FREE';
  return PLAN_FEATURES[validPlan];
}

/**
 * Check if user can create more projects
 */
export function canCreateProject(plan: PlanTier | string | null | undefined, currentProjectCount: number): boolean {
  const features = getPlanFeatures(plan);
  return features.unlimitedProjects || currentProjectCount < features.maxProjects;
}

/**
 * Check if user can create more tasks in a project
 */
export function canCreateTask(plan: PlanTier | string | null | undefined, currentTaskCount: number): boolean {
  const features = getPlanFeatures(plan);
  return features.unlimitedTasks || currentTaskCount < features.maxTasksPerProject;
}

/**
 * Get remaining projects/tasks for a plan
 */
export function getRemainingProjects(plan: PlanTier | string | null | undefined, currentCount: number): number | 'unlimited' {
  const features = getPlanFeatures(plan);
  if (features.unlimitedProjects) return 'unlimited';
  return Math.max(0, features.maxProjects - currentCount);
}

export function getRemainingTasks(plan: PlanTier | string | null | undefined, currentCount: number): number | 'unlimited' {
  const features = getPlanFeatures(plan);
  if (features.unlimitedTasks) return 'unlimited';
  return Math.max(0, features.maxTasksPerProject - currentCount);
}
