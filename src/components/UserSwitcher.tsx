'use client';

import { useState } from 'react';
import Button from '@/app/_components/Button';
import CardBox from '@/app/_components/CardBox';
import FormField from '@/app/_components/FormField';
import PillTag from '@/app/_components/PillTag';
import { useAuth, TEST_USERS } from '@/lib/auth';
import { mdiAccount, mdiAccountSwitch, mdiLogout } from '@mdi/js';
import Icon from '@/app/_components/Icon';

const USER_OPTIONS = [
  { value: TEST_USERS.ADMIN.email, label: 'Admin User', role: 'admin' },
  { value: TEST_USERS.MANAGER.email, label: 'Manager User', role: 'manager' },
  { value: TEST_USERS.USER.email, label: 'Regular User', role: 'user' },
];

export function UserSwitcher() {
  const { user, mockLogin, mockLogout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  const handleUserSwitch = async (email: string) => {
    setIsLoading(true);
    try {
      await mockLogin(email);
      // Ricarica la pagina per aggiornare l'interfaccia
      window.location.reload();
    } catch (error) {
      console.error('Errore durante il cambio utente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    mockLogout();
    window.location.reload();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'info';
      case 'user': return 'success';
      default: return 'light';
    }
  };

  return (
    <CardBox className="w-full max-w-md">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon path={mdiAccountSwitch} size="24" />
          <h3 className="text-lg font-semibold">Test User Switcher</h3>
        </div>
        
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon path={mdiAccount} size="20" />
              <span className="text-sm font-medium">{user.email}</span>
              <PillTag 
                label={user.role.toUpperCase()} 
                color={getRoleBadgeColor(user.role)}
                small
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cambia utente:</label>
              <FormField>
                {(fieldData) => (
                  <select 
                    value={selectedUser}
                    onChange={(e) => {
                      setSelectedUser(e.target.value);
                      if (e.target.value) {
                        handleUserSwitch(e.target.value);
                      }
                    }}
                    disabled={isLoading}
                    className={fieldData.className}
                  >
                    <option value="">Seleziona un utente</option>
                    {USER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.role})
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
            </div>

            <Button 
              onClick={handleLogout} 
              color="lightDark"
              outline
              small
              icon={mdiLogout}
              label="Logout"
              className="w-full"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Nessun utente autenticato. Seleziona un utente per testare:
            </p>
            
            <FormField>
              {(fieldData) => (
                <select 
                  value={selectedUser}
                  onChange={(e) => {
                    setSelectedUser(e.target.value);
                    if (e.target.value) {
                      handleUserSwitch(e.target.value);
                    }
                  }}
                  disabled={isLoading}
                  className={fieldData.className}
                >
                  <option value="">Seleziona un utente</option>
                  {USER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.role})
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-4">
          💡 Questo componente è solo per testing. In produzione l'autenticazione sarà gestita da Stack Auth.
        </div>
      </div>
    </CardBox>
  );
}