'use client';

import { useUser } from '@stackframe/stack';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Shadcn
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';

interface Contact {
  id: string;
  name: string;
}

function ContactsContent() {
  const user = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (user) {
      fetch('/api/contacts')
        .then(res => res.json())
        .then(setContacts)
        .catch(err => console.error('Failed to fetch contacts:', err));
    }
  }, [user]);

  if (!user) {
    return <div>Please log in to view contacts.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map(c => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Contacts() {
  return (
    <Suspense fallback={<div>Loading contacts...</div>}>
      <ContactsContent />
    </Suspense>
  );
}