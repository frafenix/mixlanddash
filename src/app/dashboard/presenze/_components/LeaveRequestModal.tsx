"use client";

import { useState } from "react";
import CardBoxModal from "../../../_components/CardBox/Modal";
import Button from "../../../_components/Button";
import Icon from "../../../_components/Icon";
import { mdiCalendar, mdiClockOutline, mdiSend } from "@mdi/js";
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { it } from "date-fns/locale";

interface LeaveRequestModalProps {
  isActive: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: "ferie" | "permesso";
    hours: number;
    selectedDates: string[];
  }) => void;
}

export default function LeaveRequestModal({ isActive, onClose, onSubmit }: LeaveRequestModalProps) {
  const [type, setType] = useState<"ferie" | "permesso">("ferie");
  const [hours, setHours] = useState<number>(8);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const getDaysInMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  };

  const handleDateToggle = (dateStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleFinalSubmit = () => {
    onSubmit({
      type,
      hours,
      selectedDates,
    });

    // Reset state
    setType("ferie");
    setHours(8);
    setSelectedDates([]);
    onClose();
  };

  return (
    <CardBoxModal
      title="Richiesta Ferie e Permessi"
      buttonColor="success"
      buttonLabel="Invia Richiesta"
      isActive={isActive}
      onConfirm={handleFinalSubmit}
      onCancel={onClose}
      className="bg-white max-w-2xl overflow-y-auto max-h-screen"
    >
      <div className="space-y-6">
        {/* Tipo di richiesta */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Tipo di richiesta</h3>
          <div className="flex space-x-4">
            <Button
              color={type === "ferie" ? "info" : "lightDark"}
              label="Ferie"
              onClick={() => setType("ferie")}
            />
            <Button
              color={type === "permesso" ? "info" : "lightDark"}
              label="Permesso"
              onClick={() => setType("permesso")}
            />
          </div>
        </div>

        {/* Ore */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Icon path={mdiClockOutline} size="20" className="text-blue-500" />
            <h3 className="text-lg font-semibold">Ore</h3>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setHours(Math.max(0, hours - 1))}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-bold text-xl"
              >
                -
              </button>
              <div className="px-6 py-2 bg-white dark:bg-slate-800 text-center min-w-[80px]">
                <span className="text-lg font-semibold">{hours}</span>
                <span className="text-sm ml-1">ore</span>
              </div>
              <button
                onClick={() => setHours(Math.min(12, hours + 1))}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-bold text-xl"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Selezione giorni */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Icon path={mdiCalendar} size="20" className="text-blue-500" />
            <h3 className="text-lg font-semibold">Seleziona i giorni</h3>
          </div>

          {/* Navigazione Mese */}
          <div className="flex items-center justify-between mb-4">
            <Button
              color="lightDark"
              label="← Mese Prec."
              onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
              small
            />
            <span className="font-medium">
              {format(currentMonth, "MMMM yyyy", { locale: it })}
            </span>
            <Button
              color="lightDark"
              label="Mese Succ. →"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              small
            />
          </div>

          {/* Griglia giorni del mese */}
          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth(currentMonth).map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const isSelected = selectedDates.includes(dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateToggle(dateStr)}
                  className={`
                    p-2 rounded-lg border-2 transition-all duration-200 text-center
                    ${isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"}
                  `}
                >
                  <div className="text-xs font-medium mb-1">
                    {format(day, "EEE", { locale: it })}
                  </div>
                  <div className="text-sm font-semibold">
                    {format(day, "dd")}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedDates.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedDates.length} giorni selezionati
              </p>
            </div>
          )}
        </div>
      </div>
    </CardBoxModal>
  );
}