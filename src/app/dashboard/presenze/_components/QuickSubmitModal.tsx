"use client";

import { useState } from "react";
import { mdiClose, mdiHamburger, mdiLaptop, mdiClockOutline, mdiCheck, mdiFood } from "@mdi/js";
import CardBoxModal from "../../../_components/CardBox/Modal";
import Button from "../../../_components/Button";
import Icon from "../../../_components/Icon";

interface QuickSubmitModalProps {
  isActive: boolean;
  onClose: () => void;
  onSubmit: (data: {
    hours: number;
    mealVoucher: boolean;
    workLocation: 'office' | 'remote';
  }) => void;
}

export default function QuickSubmitModal({ 
  isActive, 
  onClose, 
  onSubmit 
}: QuickSubmitModalProps) {
  const [hours, setHours] = useState<number>(8);
  const [mealVoucher, setMealVoucher] = useState<boolean>(true);
  const [workLocation, setWorkLocation] = useState<'office' | 'remote'>('office');

  const handleSubmit = () => {
    onSubmit({
      hours,
      mealVoucher,
      workLocation
    });
    onClose();
  };

  const hourOptions = [
    { value: 0, label: "0 ore" },
    { value: 2, label: "2 ore" },
    { value: 4, label: "4 ore" },
    { value: 6, label: "6 ore" },
    { value: 8, label: "8 ore" },
    { value: 10, label: "10 ore" },
    { value: 12, label: "12 ore" }
  ];

  return (
    <CardBoxModal
      title="Invio Rapido Presenze"
      buttonColor="info"
      buttonLabel=""
      isActive={isActive}
      onConfirm={handleSubmit}
      onCancel={onClose}
      className="bg-white"
    >
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

        {/* Anteprima */}
        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Anteprima:</h4>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Ore:</span> {hours}</p>
            <p><span className="font-medium">Buono pasto:</span> {mealVoucher ? 'Sì' : 'No'}</p>
            <p><span className="font-medium">Modalità:</span> {workLocation === 'office' ? 'Ufficio' : 'Remoto'}</p>
          </div>
        </div>

        {/* Pulsanti azione */}
        <div className="flex space-x-3 pt-4">
          <Button
            color="lightDark"
            label="Annulla"
            onClick={onClose}
            className="flex-1"
          />
          <Button
            color="success"
            label="Applica a giorni lavorativi"
            onClick={handleSubmit}
            className="flex-1"
          />
        </div>
      </div>
    </CardBoxModal>
  );
}