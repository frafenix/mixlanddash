"use client";

import React, { useState } from "react";
import {
  mdiCogOutline,
  mdiShieldAccount,
  mdiOfficeBuilding,
  mdiClockOutline,
  mdiFoodForkDrink,
  mdiHomeAccount,
  mdiContentSave,
  mdiRestore,
  mdiAlert,
  mdiCheckCircle,
  mdiPencil,
  mdiPlus,
  mdiDelete,
} from "@mdi/js";
import SectionMain from "../../_components/Section/Main";
import CardBox from "../../_components/CardBox";
import Button from "../../_components/Button";
import Icon from "../../_components/Icon";
import { AdminOnly } from "../../_components/RoleBasedAccess";

// Mock data per le impostazioni
const mockRoles = [
  {
    id: 1,
    name: "Admin",
    description: "Accesso completo a tutte le funzionalità",
    permissions: ["read", "write", "delete", "manage_users", "manage_settings"],
    users: 2,
  },
  {
    id: 2,
    name: "Manager",
    description: "Gestione del proprio team e approvazioni",
    permissions: ["read", "write", "approve_attendance", "manage_team"],
    users: 3,
  },
  {
    id: 3,
    name: "User",
    description: "Accesso base per inserimento presenze",
    permissions: ["read", "write_own"],
    users: 8,
  },
];

const mockCompanySettings = {
  workingHours: {
    standardHours: 8,
    startTime: "09:00",
    endTime: "18:00",
    lunchBreak: 60,
  },
  mealVouchers: {
    enabled: true,
    dailyAmount: 8.0,
    workingDaysOnly: true,
    minimumHours: 6,
  },
  remoteWork: {
    enabled: true,
    maxDaysPerWeek: 3,
    requiresApproval: false,
    advanceNotice: 24,
  },
  attendance: {
    lateThreshold: 15,
    earlyLeaveThreshold: 30,
    requiresJustification: true,
    autoApproval: false,
  },
};

export default function ImpostazioniPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'company' | 'notifications'>('roles');
  const [settings, setSettings] = useState(mockCompanySettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    // Qui implementeresti la logica per salvare le impostazioni
    console.log("Saving settings:", settings);
    setHasChanges(false);
  };

  const handleResetSettings = () => {
    setSettings(mockCompanySettings);
    setHasChanges(false);
  };

  return (
    <AdminOnly>
      <SectionMain>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Impostazioni
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configura ruoli, permessi e parametri aziendali
          </p>
        </div>

        {/* Alert per modifiche non salvate */}
        {hasChanges && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-center">
              <Icon path={mdiAlert} size={1} className="text-yellow-600 dark:text-yellow-400 mr-3" />
              <div className="flex-1">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Hai modifiche non salvate. Ricordati di salvare le impostazioni.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  icon={mdiContentSave}
                  label="Salva"
                  color="success"
                  small
                  onClick={handleSaveSettings}
                />
                <Button
                  icon={mdiRestore}
                  label="Ripristina"
                  color="warning"
                  small
                  outline
                  onClick={handleResetSettings}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon path={mdiShieldAccount} size={0.8} className="inline mr-2" />
                Ruoli & Permessi
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'company'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon path={mdiOfficeBuilding} size={0.8} className="inline mr-2" />
                Parametri Aziendali
              </button>
            </nav>
          </div>
        </div>

        {/* Roles & Permissions Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <CardBox>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Ruoli e Permessi
                  </h2>
                  <Button
                    icon={mdiPlus}
                    label="Nuovo Ruolo"
                    color="success"
                  />
                </div>

                <div className="grid gap-4">
                  {mockRoles.map((role) => (
                    <div
                      key={role.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mr-3">
                              {role.name}
                            </h3>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                              {role.users} utenti
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {role.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded"
                              >
                                {permission.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            icon={mdiPencil}
                            color="warning"
                            small
                            outline
                          />
                          {role.name !== 'Admin' && (
                            <Button
                              icon={mdiDelete}
                              color="danger"
                              small
                              outline
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardBox>
          </div>
        )}

        {/* Company Settings Tab */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            {/* Orari di Lavoro */}
            <CardBox>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <Icon path={mdiClockOutline} size={1} className="text-blue-600 dark:text-blue-400 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Orari di Lavoro
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ore Standard
                    </label>
                    <input
                      type="number"
                      value={settings.workingHours.standardHours}
                      onChange={(e) => handleSettingChange('workingHours', 'standardHours', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Inizio Lavoro
                    </label>
                    <input
                      type="time"
                      value={settings.workingHours.startTime}
                      onChange={(e) => handleSettingChange('workingHours', 'startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fine Lavoro
                    </label>
                    <input
                      type="time"
                      value={settings.workingHours.endTime}
                      onChange={(e) => handleSettingChange('workingHours', 'endTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pausa Pranzo (min)
                    </label>
                    <input
                      type="number"
                      value={settings.workingHours.lunchBreak}
                      onChange={(e) => handleSettingChange('workingHours', 'lunchBreak', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </CardBox>

            {/* Buoni Pasto */}
            <CardBox>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <Icon path={mdiFoodForkDrink} size={1} className="text-green-600 dark:text-green-400 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Buoni Pasto
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mealVouchersEnabled"
                      checked={settings.mealVouchers.enabled}
                      onChange={(e) => handleSettingChange('mealVouchers', 'enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="mealVouchersEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Abilita buoni pasto
                    </label>
                  </div>

                  {settings.mealVouchers.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Importo Giornaliero (€)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={settings.mealVouchers.dailyAmount}
                          onChange={(e) => handleSettingChange('mealVouchers', 'dailyAmount', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ore Minime
                        </label>
                        <input
                          type="number"
                          value={settings.mealVouchers.minimumHours}
                          onChange={(e) => handleSettingChange('mealVouchers', 'minimumHours', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center pt-6">
                        <input
                          type="checkbox"
                          id="workingDaysOnly"
                          checked={settings.mealVouchers.workingDaysOnly}
                          onChange={(e) => handleSettingChange('mealVouchers', 'workingDaysOnly', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="workingDaysOnly" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Solo giorni lavorativi
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardBox>

            {/* Lavoro Remoto */}
            <CardBox>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <Icon path={mdiHomeAccount} size={1} className="text-purple-600 dark:text-purple-400 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Lavoro Remoto
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remoteWorkEnabled"
                      checked={settings.remoteWork.enabled}
                      onChange={(e) => handleSettingChange('remoteWork', 'enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remoteWorkEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Abilita lavoro remoto
                    </label>
                  </div>

                  {settings.remoteWork.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Giorni/Settimana
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={settings.remoteWork.maxDaysPerWeek}
                          onChange={(e) => handleSettingChange('remoteWork', 'maxDaysPerWeek', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Preavviso (ore)
                        </label>
                        <input
                          type="number"
                          value={settings.remoteWork.advanceNotice}
                          onChange={(e) => handleSettingChange('remoteWork', 'advanceNotice', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center pt-6">
                        <input
                          type="checkbox"
                          id="requiresApproval"
                          checked={settings.remoteWork.requiresApproval}
                          onChange={(e) => handleSettingChange('remoteWork', 'requiresApproval', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="requiresApproval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Richiede approvazione
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardBox>

            {/* Controlli Presenze */}
            <CardBox>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <Icon path={mdiCheckCircle} size={1} className="text-orange-600 dark:text-orange-400 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Controlli Presenze
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Soglia Ritardo (min)
                    </label>
                    <input
                      type="number"
                      value={settings.attendance.lateThreshold}
                      onChange={(e) => handleSettingChange('attendance', 'lateThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Soglia Uscita Anticipata (min)
                    </label>
                    <input
                      type="number"
                      value={settings.attendance.earlyLeaveThreshold}
                      onChange={(e) => handleSettingChange('attendance', 'earlyLeaveThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requiresJustification"
                      checked={settings.attendance.requiresJustification}
                      onChange={(e) => handleSettingChange('attendance', 'requiresJustification', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requiresJustification" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Richiedi giustificazione per ritardi/uscite anticipate
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoApproval"
                      checked={settings.attendance.autoApproval}
                      onChange={(e) => handleSettingChange('attendance', 'autoApproval', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoApproval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Approvazione automatica presenze regolari
                    </label>
                  </div>
                </div>
              </div>
            </CardBox>

            {/* Pulsanti di Salvataggio */}
            <div className="flex justify-end space-x-4">
              <Button
                icon={mdiRestore}
                label="Ripristina Predefinite"
                color="warning"
                outline
                onClick={handleResetSettings}
              />
              <Button
                icon={mdiContentSave}
                label="Salva Impostazioni"
                color="success"
                onClick={handleSaveSettings}
                disabled={!hasChanges}
              />
            </div>
          </div>
        )}
      </SectionMain>
      </AdminOnly>
    );
  }