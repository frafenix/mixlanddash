"use client";

import { useState, useEffect } from "react";
import { mdiClose, mdiHamburger, mdiLaptop, mdiClockOutline, mdiCheck, mdiFood, mdiCalendar, mdiSend, mdiAlert } from "@mdi/js";
import CardBoxModal from "../../../_components/CardBox/Modal";
import Button from "../../../_components/Button";
import Icon from "../../../_components/Icon";
import { format, addDays, isWeekend, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";

interface QuickSubmitModalProps {
  isActive: boolean;
  onClose: () => void;
  onSubmit: (data: {
    hours: number;
    mealVoucher: boolean;
    workLocation: 'office' | 'remote';
    selectedDates: string[];
  }) => void;
}

export default function QuickSubmitModal({
  isActive,
  onClose,
  onSubmit,
}: QuickSubmitModalProps) {
  const [hours, setHours] = useState<number>(8);
  const [mealVoucher, setMealVoucher] = useState<boolean>(true);
  const [workLocation, setWorkLocation] = useState<'office' | 'remote'>('office');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [step, setStep] = useState<'config' | 'dates' | 'confirm'>('config');

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

  const handleSelectAllWorkingDays = () => {
    const allDaysInMonth = getDaysInMonth(currentMonth);
    const allWorkingDates = allDaysInMonth
      .filter((day) => !isWeekend(day))
      .map((day) => format(day, 'yyyy-MM-dd'));
    setSelectedDates(allWorkingDates);
  };

  const handleClearSelection = () => {
    setSelectedDates([]);
  };

  const handleFinalSubmit = () => {
    onSubmit({
      hours,
      mealVoucher,
      workLocation,
      selectedDates,
    });

    // Reset state
    setStep('config');
    setSelectedDates([]);
    onClose();
  };

  const handleNext = () => {
    if (step === 'config') {
      setStep('dates');
    } else if (step === 'dates') {
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'dates') {
      setStep('config');
    } else if (step === 'confirm') {
      setStep('dates');
    }
  };

  // Reset step when modal closes
  useEffect(() => {
    if (!isActive) {
      setStep('config');
      setSelectedDates([]);
    }
  }, [isActive]);

  const renderConfigStep = () => (
    <div className="space-y-6">
      {/* Selettore ore con frecce su/giù */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Icon path={mdiClockOutline} size="20" className="text-blue-500" />
          <h3 className="text-lg font-semibold">Ore di lavoro</h3>
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

      {/* Buono pasto */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Icon path={mdiFood} size="20" className="text-blue-500" />
          <h3 className="text-lg font-semibold">Buono pasto</h3>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mealVoucher ? 'Buono pasto incluso' : 'Buono pasto non incluso'}
          </p>
          <button
            onClick={() => setMealVoucher(!mealVoucher)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
              ${mealVoucher ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                ${mealVoucher ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Toggle lavoro remoto */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Icon path={mdiLaptop} size="20" className="text-green-500" />
          <h3 className="text-lg font-semibold">Modalità di lavoro</h3>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {workLocation === 'remote' ? 'Lavoro da remoto' : 'Lavoro in ufficio'}
          </p>
          <button
            onClick={() => setWorkLocation(workLocation === 'office' ? 'remote' : 'office')}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
              ${workLocation === 'remote' ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                ${workLocation === 'remote' ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Anteprima configurazione */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Configurazione:</h4>
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Ore:</span> {hours}</p>
          <p><span className="font-medium">Buono pasto:</span> {mealVoucher ? 'Sì' : 'No'}</p>
          <p><span className="font-medium">Modalità:</span> {workLocation === 'office' ? 'Ufficio' : 'Remoto'}</p>
        </div>
      </div>
    </div>
  );

  const renderDatesStep = () => (
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
          {format(currentMonth, 'MMMM yyyy', { locale: it })}
        </span>
        <Button
          color="lightDark"
          label="Mese Succ. →"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          small
        />
      </div>

      {/* Azioni rapide */}
      <div className="flex space-x-2 mb-4">
        <Button
          color="info"
          label="Seleziona tutti i giorni lavorativi"
          onClick={handleSelectAllWorkingDays}
          small
          outline
        />
        <Button
          color="lightDark"
          label="Deseleziona tutto"
          onClick={handleClearSelection}
          small
          outline
        />
      </div>

      {/* Griglia giorni del mese */}
      <div className="grid grid-cols-7 gap-2">
        {getDaysInMonth(currentMonth).map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = selectedDates.includes(dateStr);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const isNonWorking = isWeekend(day);

          return (
            <button
              key={dateStr}
              onClick={() => handleDateToggle(dateStr)}
              disabled={isNonWorking}
              className={`
                p-2 rounded-lg border-2 transition-all duration-200 text-center
                ${isNonWorking ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed' : ''}
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }
                ${isToday ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <div className="text-xs font-medium mb-1">
                {format(day, 'EEE', { locale: it })}
              </div>
              <div className="text-sm font-semibold">
                {format(day, 'dd')}
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
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon path={mdiCheck} size="20" className="text-green-500" />
        <h3 className="text-lg font-semibold">Conferma invio</h3>
      </div>

      {/* Riepilogo configurazione */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Configurazione:</h4>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Ore per giorno:</span> {hours}</p>
            <p><span className="font-medium">Buono pasto:</span> {mealVoucher ? 'Sì' : 'No'}</p>
            <p><span className="font-medium">Modalità:</span> {workLocation === 'office' ? 'Ufficio' : 'Remoto'}</p>
          </div>
        </div>
      </div>

      {/* Riepilogo giorni selezionati */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Riepilogo Giorni Selezionati:</h4>
        {selectedDates.length > 0 ? (
          <>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              {selectedDates.length} giorni selezionati per un totale di {selectedDates.length * hours} ore.
            </p>
            <div className="grid grid-cols-3 gap-2 text-sm text-blue-700 dark:text-blue-300">
              {selectedDates.sort().map(date => (
                <span key={date}>{format(new Date(date), 'dd MMM yyyy', { locale: it })}</span>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Nessun giorno selezionato.</p>
        )}
      </div>

      <div className="flex items-start p-4 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
        <Icon path={mdiAlert} size={24} className="text-yellow-500 mr-3" />
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Stai per inviare le presenze per i giorni selezionati. Questa azione non può essere annullata.
        </p>
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (step) {
      case 'config':
        return renderConfigStep();
      case 'dates':
        return renderDatesStep();
      case 'confirm':
        return renderConfirmStep();
      default:
        return renderConfigStep();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'config':
        return 'Invio Rapido Presenze - Configurazione';
      case 'dates':
        return 'Invio Rapido Presenze - Selezione Giorni';
      case 'confirm':
        return 'Invio Rapido Presenze - Conferma';
      default:
        return 'Invio Rapido Presenze';
    }
  };

  return (
    <CardBoxModal
      title={getStepTitle()}
      buttonColor="success"
      buttonLabel=""
      isActive={isActive}
      onConfirm={() => {}} // Dummy function since we're using hideFooter
      onCancel={onClose}
      hideFooter={true} // Hide the default footer to prevent duplicated buttons
      className="bg-white max-w-2xl overflow-y-auto max-h-screen"
    >
      <div className="space-y-6">
        {/* Indicatore step */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === 'config' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
          }`}>
            1
          </div>
          <div className={`w-8 h-1 ${step === 'dates' || step === 'confirm' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === 'dates' ? 'bg-blue-500 text-white' : step === 'confirm' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
          }`}>
            2
          </div>
          <div className={`w-8 h-1 ${step === 'confirm' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === 'confirm' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
          }`}>
            3
          </div>
        </div>

        {getStepContent()}

        {/* Pulsanti navigazione */}
        <div className="flex justify-between items-center pt-4 mt-6 border-t border-gray-200 dark:border-slate-700">
          <div>
            {step !== 'config' && (
              <Button
                color="info"
                label="Indietro"
                onClick={handleBack}
                outline
              />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              color="lightDark"
              label="Annulla"
              onClick={onClose}
              outline
            />
            <Button
              color={step === 'confirm' ? 'success' : 'info'}
              label={step === 'confirm' ? 'Invia Presenze' : 'Avanti'}
              onClick={step === 'confirm' ? handleFinalSubmit : handleNext}
              disabled={step === 'dates' && selectedDates.length === 0}
              icon={step === 'confirm' ? mdiSend : undefined}
            />
          </div>
        </div>
      </div>
    </CardBoxModal>
  );
}
