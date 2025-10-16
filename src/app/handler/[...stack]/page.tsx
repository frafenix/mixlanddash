import { StackHandler } from '@stackframe/stack';
import { stackServerApp } from '@/lib/stack';

export default function Handler(props: { params: any, searchParams: any }) {
  return (
    <StackHandler
      app={stackServerApp}
      routeProps={props}
      fullPage={true}
    />
  );
}