import { useState } from "react";
import Button from "../../../_components/Button";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import FormCheckRadio from "../../../_components/FormField/CheckRadio";
import Icon from "../../../_components/Icon";
import PillTag from "../../../_components/PillTag";

// Icona personalizzata per il buono pasto
const MealVoucherIcon = ({ className = "" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    className={`w-5 h-5 ${className}`}
  >
    <path 
      fill="currentColor" 
      d="M8.1,13.34L3.91,9.16C2.35,7.59 2.35,5.06 3.91,3.5L10.93,10.5L8.1,13.34M14.88,11.53L13.41,13L20.29,19.88L18.88,21.29L12,14.41L5.12,21.29L3.71,19.88L13.47,10.12C12.76,8.59 13.26,6.44 14.85,4.85C16.76,2.93 19.5,2.57 20.96,4.03C22.43,5.5 22.07,8.24 20.15,10.15C18.56,11.74 16.41,12.24 14.88,11.53Z" 
    />
  </svg>
);

interface DailyAttendanceProps {
  date: Date;
  hours: number;
  isEditable: boolean;
  onChange: (hours: number, hasMealVoucher: boolean, workLocation?: 'office' | 'remote') => void;
  hasMealVoucher: boolean;
  workLocation?: 'office' | 'remote';
}

export default function DailyAttendance({
  date,
  hours,
  isEditable,
  onChange,
  hasMealVoucher,
  workLocation,
}: DailyAttendanceProps) {
  const [localHours, setLocalHours] = useState(hours);
  const [localMealVoucher, setLocalMealVoucher] = useState(hasMealVoucher);
  const [localWorkLocation, setLocalWorkLocation] = useState(workLocation);

  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  
  const handleHoursChange = (value: number) => {
    const validHours = Math.min(Math.max(0, value), 24);
    setLocalHours(validHours);
    onChange(validHours, localMealVoucher, localWorkLocation);
  };
  
  const handleMealVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMealVoucher(e.target.checked);
    onChange(localHours, e.target.checked, localWorkLocation);
  };
  
  const handleWorkLocationChange = (location: 'office' | 'remote' | undefined) => {
    setLocalWorkLocation(location);
    onChange(localHours, localMealVoucher, location);
  };

  return (
    <div className={`p-4 rounded-lg border mb-2 ${isWeekend ? 'bg-gray-50 dark:bg-slate-900/50' : ''} hover:shadow-md transition-shadow duration-200`}>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-medium">{format(date, "EEEE dd MMMM yyyy", { locale: it })}</h3>
        </div>
        {isEditable && (
          <div className="flex space-x-2">
            <Button
              color="info"
              small
              onClick={() => handleHoursChange(8)}
              label="8h"
            />
            <Button
              color="info"
              small
              onClick={() => handleHoursChange(0)}
              label="0h"
            />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-sm font-medium mb-1">Ore lavorate</label>
          {isEditable ? (
            <input
              type="number"
              min="0"
              max="24"
              value={localHours}
              onChange={(e) => handleHoursChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          ) : (
            <div className="px-3 py-2 border rounded bg-gray-50 dark:bg-slate-800/50 dark:border-slate-700">
              {localHours}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Luogo di lavoro</label>
          {isEditable ? (
            <div className="flex space-x-2">
              <Button
                color={localWorkLocation === 'office' ? 'info' : 'white'}
                small
                icon="mdiOfficeBuilding"
                label="Ufficio"
                onClick={() => handleWorkLocationChange('office')}
              />
              <Button
                color={localWorkLocation === 'remote' ? 'success' : 'white'}
                small
                icon="mdiHome"
                label="Remoto"
                onClick={() => handleWorkLocationChange('remote')}
              />
            </div>
          ) : (
            <div className="px-3 py-2 border rounded bg-gray-50 dark:bg-slate-800/50 dark:border-slate-700">
              {localWorkLocation === 'office' ? 'Ufficio' : localWorkLocation === 'remote' ? 'Remoto' : 'Non specificato'}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Buono pasto</label>
          {isEditable ? (
            <div className="flex items-center space-x-2">
              <FormCheckRadio type="switch" className="mr-2">
                <input
                  type="checkbox"
                  checked={localMealVoucher}
                  onChange={handleMealVoucherChange}
                  className="mr-2"
                />
                <span className="check" />
              </FormCheckRadio>
              <MealVoucherIcon className={localMealVoucher ? "text-emerald-500" : "text-gray-400 dark:text-gray-600"} />
              <PillTag
                small
                label={localMealVoucher ? "Utilizzato" : "Non utilizzato"}
                color={localMealVoucher ? "success" : "contrast"}
              />
            </div>
          ) : (
            <div className="px-3 py-2 border rounded bg-gray-50 dark:bg-slate-800/50 dark:border-slate-700 flex items-center space-x-2">
              <MealVoucherIcon className={localMealVoucher ? "text-emerald-500" : "text-gray-400 dark:text-gray-600"} />
              <PillTag
                small
                label={localMealVoucher ? "Utilizzato" : "Non utilizzato"}
                color={localMealVoucher ? "success" : "contrast"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}