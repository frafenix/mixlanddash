"use client";

import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { format, differenceInDays, isWeekend, addDays } from "date-fns";
import { it } from "date-fns/locale";
import CardBox from "../../../_components/CardBox";
import Button from "../../../_components/Button";
import FormField from "../../../_components/FormField";
import OverlayLayer from "../../../_components/OverlayLayer";
import { 
  mdiClose, 
  mdiCalendar, 
  mdiClockOutline, 
  mdiBeach, 
  mdiLaptop,
  mdiPaperclip,
  mdiAlert,
  mdiCheckCircle
} from "@mdi/js";
import Icon from "../../../_components/Icon";
import PillTag from "../../../_components/PillTag";
import { ColorKey } from "../../../_interfaces";

type LeaveRequestType = "ferie" | "permesso" | "smart_working";

interface LeaveBalance {
  ferieAvailable: number;
  permessiAvailable: number;
}

interface NewRequestModalProps {
  isActive: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  leaveBalance: LeaveBalance;
}

interface FormValues {
  type: LeaveRequestType;
  startDate: string;
  endDate: string;
  reason: string;
  attachments: File[];
}

const validationSchema = Yup.object({
  type: Yup.string().required("Seleziona il tipo di richiesta"),
  startDate: Yup.date().required("Seleziona la data di inizio").min(new Date(), "La data non può essere nel passato"),
  endDate: Yup.date().required("Seleziona la data di fine").min(Yup.ref("startDate"), "La data di fine deve essere successiva a quella di inizio"),
  reason: Yup.string().required("Inserisci una motivazione").min(10, "La motivazione deve essere di almeno 10 caratteri"),
});

const getTypeIcon = (type: LeaveRequestType) => {
  switch (type) {
    case "ferie":
      return mdiBeach;
    case "permesso":
      return mdiClockOutline;
    case "smart_working":
      return mdiLaptop;
    default:
      return mdiCalendar;
  }
};

const getTypeColor = (type: LeaveRequestType): ColorKey => {
  switch (type) {
    case "ferie":
      return "success";
    case "permesso":
      return "info";
    case "smart_working":
      return "warning";
    default:
      return "light";
  }
};

const calculateWorkingDays = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;
  
  for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
    if (!isWeekend(date)) {
      workingDays++;
    }
  }
  
  return workingDays;
};

export default function NewRequestModal({ 
  isActive, 
  onClose, 
  onSubmit, 
  leaveBalance 
}: NewRequestModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const initialValues: FormValues = {
    type: "ferie",
    startDate: "",
    endDate: "",
    reason: "",
    attachments: [],
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (values: FormValues) => {
    const workingDays = calculateWorkingDays(values.startDate, values.endDate);
    
    onSubmit({
      ...values,
      days: workingDays,
      attachments: selectedFiles,
    });
    
    setSelectedFiles([]);
    onClose();
  };

  if (!isActive) return null;

  return (
    <OverlayLayer onClick={onClose}>
      <CardBox
        className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Nuova Richiesta</h2>
          <Button
            icon={mdiClose}
            color="lightDark"
            onClick={onClose}
            small
            roundedFull
          />
        </div>

        <div className="p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue }) => {
              const workingDays = calculateWorkingDays(values.startDate, values.endDate);
              const isValidDays = values.type === "ferie" 
                ? workingDays <= leaveBalance.ferieAvailable
                : values.type === "permesso" 
                ? workingDays * 8 <= leaveBalance.permessiAvailable // Assumendo 8 ore per giorno
                : true; // Smart working non ha limiti

              return (
                <Form className="space-y-6">
                  {/* Tipo di richiesta */}
                  <div className="mb-6">
                    <label className="block mb-2 font-semibold">Tipo di richiesta</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(["ferie", "permesso", "smart_working"] as LeaveRequestType[]).map((type) => (
                        <label
                          key={type}
                          className={`
                            flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                            ${values.type === type 
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                            }
                          `}
                        >
                          <Field
                            type="radio"
                            name="type"
                            value={type}
                            className="sr-only"
                          />
                          <div className="flex items-center w-full">
                            <Icon 
                              path={getTypeIcon(type)} 
                              className="w-5 h-5 mr-3" 
                            />
                            <div>
                              <div className="font-medium capitalize">
                                {type === "smart_working" ? "Smart Working" : type}
                              </div>
                              <div className="text-sm text-gray-500">
                                {type === "ferie" && `${leaveBalance.ferieAvailable} giorni disponibili`}
                                {type === "permesso" && `${leaveBalance.permessiAvailable} ore disponibili`}
                                {type === "smart_working" && "Nessun limite"}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.type && touched.type && (
                      <div className="text-red-600 text-sm mt-1">{errors.type}</div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-6">
                      <label className="block mb-2 font-semibold">Data inizio</label>
                      <Field
                        type="date"
                        name="startDate"
                        className="px-3 py-2 max-w-full border-blue-700 rounded-lg w-full dark:placeholder-gray-400 focus:ring-3 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden h-12 border bg-white dark:bg-slate-800"
                        min={format(new Date(), "yyyy-MM-dd")}
                      />
                      {errors.startDate && touched.startDate && (
                        <div className="text-red-600 text-sm mt-1">{errors.startDate}</div>
                      )}
                    </div>

                    <div className="mb-6">
                      <label className="block mb-2 font-semibold">Data fine</label>
                      <Field
                        type="date"
                        name="endDate"
                        className="px-3 py-2 max-w-full border-blue-700 rounded-lg w-full dark:placeholder-gray-400 focus:ring-3 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden h-12 border bg-white dark:bg-slate-800"
                        min={values.startDate || format(new Date(), "yyyy-MM-dd")}
                      />
                      {errors.endDate && touched.endDate && (
                        <div className="text-red-600 text-sm mt-1">{errors.endDate}</div>
                      )}
                    </div>
                  </div>

                  {/* Calcolo giorni e validazione */}
                  {values.startDate && values.endDate && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          Giorni richiesti: {workingDays} {values.type === "permesso" ? "giorni" : "giorni"}
                        </span>
                        {!isValidDays && (
                          <PillTag
                            label="Saldo insufficiente"
                            color="danger"
                            icon={mdiAlert}
                            small
                          />
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {values.type === "ferie" && (
                          <div>
                            Saldo disponibile: {leaveBalance.ferieAvailable} giorni
                            {!isValidDays && (
                              <div className="text-red-600 dark:text-red-400 mt-1">
                                ⚠️ Giorni richiesti superiori al saldo disponibile
                              </div>
                            )}
                          </div>
                        )}
                        {values.type === "permesso" && (
                          <div>
                            Ore richieste: {workingDays * 8} ore
                            <br />
                            Saldo disponibile: {leaveBalance.permessiAvailable} ore
                            {!isValidDays && (
                              <div className="text-red-600 dark:text-red-400 mt-1">
                                ⚠️ Ore richieste superiori al saldo disponibile
                              </div>
                            )}
                          </div>
                        )}
                        {values.type === "smart_working" && (
                          <div className="text-green-600 dark:text-green-400">
                            ✓ Smart working - nessun limite di giorni
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Motivazione */}
                  <div className="mb-6">
                    <label className="block mb-2 font-semibold">Motivazione</label>
                    <Field
                      as="textarea"
                      name="reason"
                      rows={4}
                      className="px-3 py-2 max-w-full border-blue-700 rounded-lg w-full dark:placeholder-gray-400 focus:ring-3 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden h-24 border bg-white dark:bg-slate-800"
                      placeholder="Descrivi brevemente il motivo della richiesta..."
                    />
                    {errors.reason && touched.reason && (
                      <div className="text-red-600 text-sm mt-1">{errors.reason}</div>
                    )}
                  </div>

                  {/* Allegati */}
                  <div className="mb-6">
                    <label className="block mb-2 font-semibold">Allegati (opzionale)</label>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                          <Icon path={mdiPaperclip} className="w-4 h-4 mr-2" />
                          Aggiungi file
                        </label>
                      </div>
                      
                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                            >
                              <span className="text-sm truncate">{file.name}</span>
                              <Button
                                icon={mdiClose}
                                color="danger"
                                small
                                onClick={() => removeFile(index)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pulsanti */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      label="Annulla"
                      color="lightDark"
                      onClick={onClose}
                    />
                    <Button
                      type="submit"
                      label="Invia Richiesta"
                      color="success"
                      icon={mdiCheckCircle}
                      disabled={!isValidDays || workingDays === 0}
                    />
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </CardBox>
    </OverlayLayer>
  );
}