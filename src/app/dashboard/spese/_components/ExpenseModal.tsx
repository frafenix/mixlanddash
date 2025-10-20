"use client";

import { useState, useEffect } from "react";
import Button from "../../../_components/Button";
import CardBox from "../../../_components/CardBox";
import { Field, Form, Formik, FormikHelpers } from "formik";
import FormFilePicker, {
  Props as FormFilePickerProps,
} from "../../../_components/FormField/FilePicker";
import {
  mdiClose,
  mdiCashMultiple,
  mdiCalendar,
  mdiCurrencyEur,
  mdiFileDocument,
  mdiMapMarker,
  mdiAccount,
  mdiFolder,
} from "@mdi/js";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface ExpenseModalProps {
  isActive: boolean;
  onClose: () => void;
  onSubmit: (expenseData: any) => void;
}

type ExpenseType = "trasferta" | "vitto" | "alloggio" | "viaggio" | "altro";

export default function ExpenseModal({ isActive, onClose, onSubmit }: ExpenseModalProps) {
  const initialValues = {
    expenseType: "altro" as ExpenseType,
    date: format(new Date(), "yyyy-MM-dd"),
    amount: "",
    currency: "EUR",
    description: "",
    project: "",
    client: "",
    attachments: [] as File[],
  };

  const expenseTypeOptions = [
    { value: "trasferta", label: "Trasferta" },
    { value: "vitto", label: "Vitto" },
    { value: "alloggio", label: "Alloggio" },
    { value: "viaggio", label: "Viaggio" },
    { value: "altro", label: "Altro" },
  ];

  const currencyOptions = [
    { value: "EUR", label: "EUR - Euro" },
    { value: "USD", label: "USD - Dollaro USA" },
    { value: "GBP", label: "GBP - Sterlina Britannica" },
  ];

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    if (values.attachments.length === 0) {
      alert("Compila tutti i campi obbligatori, inclusi gli allegati");
      setSubmitting(false);
      return;
    }

    try {
      const expenseData = {
        ...values,
        amount: parseFloat(values.amount),
        attachments: values.attachments.map((file: File) => file.name),
      };
      onSubmit(expenseData);
    } catch (error) {
      console.error("Errore durante l'invio della nota spesa:", error);
      alert("Si è verificato un errore durante l'invio");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (resetForm: () => void) => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isActive) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isActive, onClose]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ isSubmitting, values, setFieldValue, resetForm }) => (
            <Form>
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d={mdiCashMultiple} clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Nuova Nota Spesa
                  </h2>
                </div>
                <Button
                  icon={mdiClose}
                  color="lightDark"
                  onClick={() => handleClose(resetForm)}
                  small
                />
              </div>

              <div className="p-6 space-y-6">
                {/* Tipo di spesa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo di spesa *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {expenseTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFieldValue('expenseType', option.value)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          values.expenseType === option.value
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data e Importo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data della spesa *
                    </label>
                    <div className="relative">
                      <Field
                        type="date"
                        name="date"
                        max={format(new Date(), "yyyy-MM-dd")}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d={mdiCalendar} clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Importo e valuta *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Field
                          type="number"
                          name="amount"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d={mdiCurrencyEur} clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <Field
                        as="select"
                        name="currency"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        {currencyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Descrizione */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrizione / Motivazione *
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={3}
                    placeholder="Descrivi la spesa..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* Progetto e Cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Progetto (opzionale)
                    </label>
                    <div className="relative">
                      <Field
                        type="text"
                        name="project"
                        placeholder="Nome progetto..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d={mdiFolder} clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cliente (opzionale)
                    </label>
                    <div className="relative">
                      <Field
                        type="text"
                        name="client"
                        placeholder="Nome cliente..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d={mdiAccount} clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allegati */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Allegati (scontrini, fatture) *
                  </label>
                  <FormFilePicker
                    label="Trascina i file qui o clicca per selezionarli"
                    help="PDF, JPG, PNG, GIF (max 5MB per file)"
                    icon={mdiFileDocument}
                    onFileChange={(files: File[]) =>
                      setFieldValue("attachments", files)
                    }
                  />
                  {values.attachments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        File selezionati:
                      </p>
                      <div className="space-y-2">
                        {values.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {file.name}
                            </span>
                            <Button
                              label="Rimuovi"
                              color="danger"
                              small
                              onClick={() => {
                                const newAttachments = [...values.attachments];
                                newAttachments.splice(index, 1);
                                setFieldValue("attachments", newAttachments);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Riepilogo */}
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Riepilogo Nota Spesa
                  </h4>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p><strong>Tipo:</strong> {expenseTypeOptions.find(opt => opt.value === values.expenseType)?.label}</p>
                    <p><strong>Data:</strong> {format(new Date(values.date), "dd/MM/yyyy", { locale: it })}</p>
                    <p><strong>Importo:</strong> {values.currency} {values.amount || "0.00"}</p>
                    {values.project && <p><strong>Progetto:</strong> {values.project}</p>}
                    {values.client && <p><strong>Cliente:</strong> {values.client}</p>}
                    {values.attachments.length > 0 && <p><strong>Allegati:</strong> {values.attachments.length} file</p>}
                  </div>
                </div>
              </div>

              {/* Footer con pulsanti */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  label="Annulla"
                  color="lightDark"
                  onClick={() => handleClose(resetForm)}
                  disabled={isSubmitting}
                />
                <Button
                  label={isSubmitting ? "Invio in corso..." : "Invia per approvazione"}
                  color="success"
                  type="submit"
                  disabled={isSubmitting}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}