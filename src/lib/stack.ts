import { StackServerApp, StackClientApp } from "@stackframe/stack";

console.log("[Stack Config] Initializing Stack Auth with:", {
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  baseUrl: process.env.NEXT_PUBLIC_STACK_BASE_URL || "https://api.stack-auth.com",
  hasPublishableKey: !!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  hasSecretKey: !!process.env.STACK_SECRET_SERVER_KEY
});

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
});

export const stackApp = new StackClientApp({
  baseUrl: process.env.NEXT_PUBLIC_STACK_BASE_URL || "https://api.stack-auth.com",
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  tokenStore: "nextjs-cookie",
});