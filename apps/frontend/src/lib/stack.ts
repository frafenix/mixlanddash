import { StackClientApp } from '@stackframe/stack';

export const stack = new StackClientApp({
  tokenStore: 'nextjs-cookie',
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || 'demo-project',
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || 'demo-key',
});