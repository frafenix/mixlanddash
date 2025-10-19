"use client";

import React, { useState } from "react";
import {
  mdiAccountMultiple,
  mdiAccountPlus,
  mdiAccountGroup,
  mdiEmail,
  mdiShield,
  mdiPencil,
  mdiDelete,
  mdiEye,
  mdiAccountOff,
  mdiRefresh,
  mdiPlus,
  mdiFilterVariant,
  mdiMagnify,
} from "@mdi/js";
import SectionMain from "../../_components/Section/Main";
import CardBox from "../../_components/CardBox";
import Button from "../../_components/Button";
import Icon from "../../_components/Icon";
import { AdminOnly } from "@/components/RoleBasedAccess";

// Mock data per team e utenti
const mockTeams = [
  {
    id: 1,
    name: "Sviluppo Frontend",
    description: "Team responsabile dello sviluppo dell'interfaccia utente",
    manager: "Mario Rossi",
    members: 5,
    status: "active",
  },
  {
    id: 2,
    name: "Backend & API",
    description: "Team per lo sviluppo dei servizi backend",
    manager: "Laura Bianchi",
    members: 4,
    status: "active",
  },
  {
    id: 3,
    name: "DevOps",
    description: "Team per l'infrastruttura e deployment",
    manager: "Giuseppe Verdi",
    members: 3,
    status: "active",
  },
];

const mockUsers = [
  {
    id: 1,
    name: "Mario Rossi",
    email: "mario.rossi@company.com",
    role: "manager",
    team: "Sviluppo Frontend",
    status: "active",
    lastAccess: "2024-01-15",
  },
  {
    id: 2,
    name: "Laura Bianchi",
    email: "laura.bianchi@company.com",
    role: "manager",
    team: "Backend & API",
    status: "active",
    lastAccess: "2024-01-15",
  },
  {
    id: 3,
    name: "Giuseppe Verdi",
    email: "giuseppe.verdi@company.com",
    role: "manager",
    team: "DevOps",
    status: "active",
    lastAccess: "2024-01-14",
  },
  {
    id: 4,
    name: "Anna Neri",
    email: "anna.neri@company.com",
    role: "user",
    team: "Sviluppo Frontend",
    status: "active",
    lastAccess: "2024-01-15",
  },
  {
    id: 5,
    name: "Marco Blu",
    email: "marco.blu@company.com",
    role: "user",
    team: "Backend & API",
    status: "inactive",
    lastAccess: "2024-01-10",
  },
];

const mockInvitations = [
  {
    id: 1,
    email: "nuovo.utente@company.com",
    role: "user",
    team: "Sviluppo Frontend",
    status: "pending",
    sentDate: "2024-01-12",
    expiryDate: "2024-01-19",
  },
  {
    id: 2,
    email: "manager.nuovo@company.com",
    role: "manager",
    team: "Marketing",
    status: "expired",
    sentDate: "2024-01-05",
    expiryDate: "2024-01-12",
  },
];

export default function TeamUsersPage() {
  const [activeTab, setActiveTab] = useState<'teams' | 'users' | 'invitations'>('teams');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'manager': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'user': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'expired': return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <AdminOnly>
      <SectionMain>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Team & Utenti
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestisci team, utenti e inviti della tua organizzazione
          </p>
        </div>

        {/* Statistiche Rapide */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <CardBox className="border-l-4 border-blue-500">
            <div className="p-6 text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Icon path={mdiAccountGroup} size={1} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{mockTeams.length}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Team Attivi</p>
            </div>
          </CardBox>

          <CardBox className="border-l-4 border-green-500">
            <div className="p-6 text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Icon path={mdiAccountMultiple} size={1} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockUsers.filter(u => u.status === 'active').length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Utenti Attivi</p>
            </div>
          </CardBox>

          <CardBox className="border-l-4 border-yellow-500">
            <div className="p-6 text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Icon path={mdiEmail} size={1} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockInvitations.filter(i => i.status === 'pending').length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Inviti Pendenti</p>
            </div>
          </CardBox>

          <CardBox className="border-l-4 border-purple-500">
            <div className="p-6 text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Icon path={mdiShield} size={1} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockUsers.filter(u => u.role === 'manager').length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Manager</p>
            </div>
          </CardBox>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('teams')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'teams'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon path={mdiAccountGroup} size={0.8} className="inline mr-2" />
                Team
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon path={mdiAccountMultiple} size={0.8} className="inline mr-2" />
                Utenti
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'invitations'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon path={mdiEmail} size={0.8} className="inline mr-2" />
                Inviti
              </button>
            </nav>
          </div>
        </div>

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <CardBox>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Gestione Team
                </h2>
                <Button
                  icon={mdiPlus}
                  label="Crea Nuovo Team"
                  color="success"
                />
              </div>

              <div className="grid gap-4">
                {mockTeams.map((team) => (
                  <div
                    key={team.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {team.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {team.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Manager: <strong>{team.manager}</strong></span>
                          <span>Membri: <strong>{team.members}</strong></span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(team.status)}`}>
                            {team.status === 'active' ? 'Attivo' : 'Inattivo'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          icon={mdiEye}
                          color="info"
                          small
                          outline
                        />
                        <Button
                          icon={mdiPencil}
                          color="warning"
                          small
                          outline
                        />
                        <Button
                          icon={mdiDelete}
                          color="danger"
                          small
                          outline
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBox>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <CardBox>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Gestione Utenti
                </h2>
                <Button
                  icon={mdiAccountPlus}
                  label="Invita Utente"
                  color="success"
                />
              </div>

              {/* Filtri */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Icon
                      path={mdiMagnify}
                      size={0.8}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Cerca utenti..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Tutti i ruoli</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="active">Attivo</option>
                  <option value="inactive">Inattivo</option>
                </select>
              </div>

              {/* Tabella Utenti */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Utente
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Ruolo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Team
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Stato
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Ultimo Accesso
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {user.team}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status === 'active' ? 'Attivo' : 'Inattivo'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {user.lastAccess}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              icon={mdiPencil}
                              color="warning"
                              small
                              outline
                            />
                            <Button
                              icon={mdiRefresh}
                              color="info"
                              small
                              outline
                            />
                            <Button
                              icon={mdiAccountOff}
                              color="danger"
                              small
                              outline
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardBox>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <CardBox>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Gestione Inviti
                </h2>
                <Button
                  icon={mdiEmail}
                  label="Nuovo Invito"
                  color="success"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Ruolo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Team
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Stato
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Inviato
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Scadenza
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockInvitations.map((invitation) => (
                      <tr key={invitation.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                          {invitation.email}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(invitation.role)}`}>
                            {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {invitation.team}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}>
                            {invitation.status === 'pending' ? 'In Attesa' : 'Scaduto'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {invitation.sentDate}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {invitation.expiryDate}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              icon={mdiRefresh}
                              color="info"
                              small
                              outline
                            />
                            <Button
                              icon={mdiDelete}
                              color="danger"
                              small
                              outline
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardBox>
        )}
      </SectionMain>
    </AdminOnly>
  );
}