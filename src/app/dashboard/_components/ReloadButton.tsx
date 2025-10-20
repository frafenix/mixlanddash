'use client';

import Button from '@/app/_components/Button';

export default function ReloadButton() {
  return (
    <Button
      onClick={() => window.location.reload()}
      label="Ricarica"
      color="info"
    />
  );
}