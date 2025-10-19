"use client";

import { useState } from "react";
import {
  mdiChartLine,
  mdiDownload,
  mdiCalendarMonth,
  mdiAccountGroup,
  mdiClockOutline,
  mdiTrendingUp,
  mdiFileExcel,
  mdiFilePdfBox,
  mdiRefresh,
} from "@mdi/js";
import SectionMain from "../../_components/Section/Main";
import SectionTitleLineWithButton from "../../_components/Section/TitleLineWithButton";
import CardBox from "../../_components/CardBox";
import Button from "../../_components/Button";
import Icon from "../../_components/Icon";
import { RoleBasedAccess } from "@/components/RoleBasedAccess";
import { Metadata } from "next";

// Dati mock per i report
const mockReportData = {
  currentMonth: "Dicembre 2024",
  teamMembers: 8,
  totalHours: 1280,
  averageHours: 160,
  attendanceRate: 95.2,
  remoteWorkRate: 35.5,
  reports: [
    {
      id: 1,
      month: "Dicembre 2024",
      teamMembers: 8,
      totalHours: 1280,
      averageHours: 160,
      attendanceRate: 95.2,
      remoteWorkRate: 35.5,
      generatedAt: "2024-12-15",
      status: "completed"
    },
    {
      id: 2,
      month: "Novembre 2024",
      teamMembers: 8,
      totalHours: 1240,
      averageHours: 155,
      attendanceRate: 92.8,
      remoteWorkRate: 40.2,
      generatedAt: "2024-11-30",
      status: "completed"
    },
    {
      id: 3,
      month: "Ottobre 2024",
      teamMembers: 7,
      totalHours: 1120,
      averageHours: 160,
      attendanceRate: 98.1,
      remoteWorkRate: 32.1,
      generatedAt: "2024-10-31",
      status: "completed"
    }
  ]
};

export default function ReportPage() {
  const [selectedMonth, setSelectedMonth] = useState("2024-12");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simula la generazione del report
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    alert("Report generato con successo!");
  };

  const handleExportCSV = () => {
    // Simula l'esportazione CSV
    alert("Esportazione CSV avviata...");
  };

  const handleExportPDF = () => {
    // Simula l'esportazione PDF
    alert("Esportazione PDF avviata...");
  };

  return (
    <RoleBasedAccess allowedRoles={['manager', 'admin']}>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiChartLine} title="Report Mensili" main>
          <Button
            icon={mdiRefresh}
            label="Aggiorna"
            color="info"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          />
        </SectionTitleLineWithButton>

        {/* Card Riassuntiva Principale */}
        <CardBox className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-l-4 border-blue-500">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Icon path={mdiChartLine} size={1.2} className="mr-3 text-blue-600" />
                Panoramica Team - {mockReportData.currentMonth}
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Dati aggiornati</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{mockReportData.teamMembers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Membri Team</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{mockReportData.totalHours}h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ore Totali</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">{mockReportData.attendanceRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tasso Presenze</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">{mockReportData.averageHours}h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Media Ore/Persona</div>
              </div>
            </div>
          </div>
        </CardBox>

        {/* Statistiche Dettagliate */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <CardBox className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500">
            <div className="p-6 text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Icon path={mdiAccountGroup} size={1.5} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {mockReportData.teamMembers}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Membri Team</p>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Team completo attivo
              </div>
            </div>
          </CardBox>

          <CardBox className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-green-500">
            <div className="p-6 text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Icon path={mdiClockOutline} size={1.5} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {mockReportData.totalHours}h
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Ore Totali</p>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Lavorate questo mese
              </div>
            </div>
          </CardBox>

          <CardBox className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-purple-500">
            <div className="p-6 text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Icon path={mdiTrendingUp} size={1.5} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {mockReportData.attendanceRate}%
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Tasso Presenze</p>
              <div className="mt-3">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Eccellente
                </span>
              </div>
            </div>
          </CardBox>

          <CardBox className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-orange-500">
            <div className="p-6 text-center">
              <div className="bg-orange-100 dark:bg-orange-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Icon path={mdiCalendarMonth} size={1.5} className="text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {mockReportData.averageHours}h
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Media Ore/Persona</p>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Per membro del team
              </div>
            </div>
          </CardBox>
        </div>

        {/* Generazione nuovo report */}
        <CardBox className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Icon path={mdiChartLine} size={1} className="mr-2 text-blue-600" />
              Genera Nuovo Report
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seleziona Mese
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                >
                  <option value="2024-12">Dicembre 2024</option>
                  <option value="2024-11">Novembre 2024</option>
                  <option value="2024-10">Ottobre 2024</option>
                  <option value="2024-09">Settembre 2024</option>
                </select>
              </div>
              <Button
                icon={mdiChartLine}
                label={isGenerating ? "Generando..." : "Genera Report"}
                color="success"
                onClick={handleGenerateReport}
                disabled={isGenerating}
              />
            </div>
          </div>
        </CardBox>

        {/* Lista report esistenti */}
        <CardBox>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Icon path={mdiDownload} size={1} className="mr-2 text-green-600" />
                Report Disponibili
              </h3>
              <div className="flex gap-2">
                <Button
                  icon={mdiFileExcel}
                  label="Esporta CSV"
                  color="success"
                  small
                  outline
                  onClick={handleExportCSV}
                />
                <Button
                  icon={mdiFilePdfBox}
                  label="Esporta PDF"
                  color="danger"
                  small
                  outline
                  onClick={handleExportPDF}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Periodo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ore Totali
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Presenze %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Remoto %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Generato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {mockReportData.reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {report.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {report.teamMembers} membri
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {report.totalHours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.attendanceRate >= 95 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : report.attendanceRate >= 90
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {report.attendanceRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {report.remoteWorkRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(report.generatedAt).toLocaleDateString('it-IT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            icon={mdiFileExcel}
                            color="success"
                            small
                            onClick={handleExportCSV}
                          />
                          <Button
                            icon={mdiFilePdfBox}
                            color="danger"
                            small
                            onClick={handleExportPDF}
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
      </SectionMain>
    </RoleBasedAccess>
  );
}