'use client';

import { StackProvider as Provider } from '@stackframe/stack';
import { stack } from '@/lib/stack';

export default function StackProvider({ children }: { children: React.ReactNode }) {
  return <Provider app={stack}>{children}</Provider>;
}