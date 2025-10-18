"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { mdiOfficeBuilding, mdiMapMarker, mdiCheck, mdiRocketLaunch } from "@mdi/js";
import SectionMain from "../_components/Section/Main";
import FormField from "../_components/FormField";
import Icon from "../_components/Icon";
import CardBox from "../_components/CardBox";
import SectionTitleLineWithButton from "../_components/Section/TitleLineWithButton";
import NotificationBar from "../_components/NotificationBar";
import Button from "../_components/Button";
import PillTag from "../_components/PillTag";

interface OnboardingData {
  companyName: string;
  companyDescription: string;
  locationName: string;
  locationAddress: string;
  locationCity: string;
}

function OnboardingContent() {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";

  const [formData, setFormData] = useState<OnboardingData>({
    companyName: "",
    companyDescription: "",
    locationName: "",
    locationAddress: "",
    locationCity: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (paymentSuccess) {
      console.log("Payment completed successfully!");
    }
  }, [paymentSuccess]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        console.error("Errore durante l'onboarding:", errorData);
        alert("Errore durante il salvataggio. Riprova.");
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      alert("Errore di connessione. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <SectionMain>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin" style={{ animationDuration: '1.5s' }}></div>
              <div className="absolute inset-2 rounded-full bg-white dark:bg-slate-900"></div>
            </div>
            <p className="text-lg font-medium text-gray-700 dark:text-slate-300">Caricamento...</p>
          </div>
        </div>
      </SectionMain>
    );
  }

  return (
    <SectionMain>
        <SectionTitleLineWithButton icon={mdiRocketLaunch} title="Configura il tuo Account" main />
        <p className="text-gray-500 dark:text-slate-400 mb-6 text-center">
          Completa questi semplici passaggi per iniziare a utilizzare la piattaforma
        </p>

        {paymentSuccess && (
          <NotificationBar color="success" icon={mdiCheck}>
            Pagamento completato con successo! Ora completa la configurazione per iniziare.
          </NotificationBar>
        )}

        {/* Progress indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <PillTag color="info" label="Passo 1" icon={mdiOfficeBuilding} />
          <div className="w-12 h-px bg-gray-200 dark:bg-slate-800" />
          <PillTag color="light" label="Passo 2" icon={mdiMapMarker} />
          <div className="w-12 h-px bg-gray-200 dark:bg-slate-800" />
          <PillTag color="contrast" label="Avvio" icon={mdiRocketLaunch} />
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* Step 1 Card */}
          <CardBox className="mb-6 border border-gray-200 dark:border-slate-800" isHoverable>
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-slate-800">
              <Icon path={mdiOfficeBuilding} size={20} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Passo 1</p>
                <h2 className="text-xl font-semibold">Informazioni Azienda</h2>
              </div>
            </div>

            <FormField label="Nome Azienda" labelFor="companyName" icon={mdiOfficeBuilding}>
              {(fieldData) => (
                <input
                  {...fieldData}
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Es. La Mia Pizzeria"
                />
              )}
            </FormField>

            <FormField 
              label="Descrizione Azienda" 
              labelFor="companyDescription" 
              help="Breve descrizione della tua attività (opzionale)"
              hasTextareaHeight
            >
              {(fieldData) => (
                <textarea
                  {...fieldData}
                  id="companyDescription"
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleInputChange}
                  placeholder="Descrivi brevemente la tua attività..."
                />
              )}
            </FormField>
          </CardBox>

          {/* Step 2 Card */}
          <CardBox
            className="mb-6 border border-gray-200 dark:border-slate-800"
            isHoverable
            footer={
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <Icon path={mdiCheck} size={16} className="inline mr-1 text-emerald-600" />
                  Tutti i campi sono obbligatori
                </div>
                <Button
                  label={isSubmitting ? "Salvataggio..." : "Completa Configurazione"}
                  icon={isSubmitting ? undefined : mdiRocketLaunch}
                  color="info"
                  roundedFull
                  type="submit"
                  disabled={isSubmitting}
                />
              </div>
            }
          >
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-slate-800">
              <Icon path={mdiMapMarker} size={20} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Passo 2</p>
                <h2 className="text-xl font-semibold">Prima Location</h2>
              </div>
            </div>

            <FormField label="Nome Location" labelFor="locationName" icon={mdiMapMarker}>
              {(fieldData) => (
                <input
                  {...fieldData}
                  id="locationName"
                  name="locationName"
                  type="text"
                  required
                  value={formData.locationName}
                  onChange={handleInputChange}
                  placeholder="Es. Sede Centrale"
                />
              )}
            </FormField>

            <FormField label="Indirizzo" labelFor="locationAddress">
              {(fieldData) => (
                <input
                  {...fieldData}
                  id="locationAddress"
                  name="locationAddress"
                  type="text"
                  required
                  value={formData.locationAddress}
                  onChange={handleInputChange}
                  placeholder="Es. Via Roma 123"
                />
              )}
            </FormField>

            <FormField label="Città" labelFor="locationCity">
              {(fieldData) => (
                <input
                  {...fieldData}
                  id="locationCity"
                  name="locationCity"
                  type="text"
                  required
                  value={formData.locationCity}
                  onChange={handleInputChange}
                  placeholder="Es. Milano"
                />
              )}
            </FormField>
          </CardBox>
        </form>
    </SectionMain>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <SectionMain>
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin" style={{ animationDuration: "1.5s" }}></div>
                  <div className="absolute inset-2 rounded-full bg-white dark:bg-slate-900"></div>
                </div>
                <p className="text-lg font-medium text-gray-700 dark:text-slate-300">Caricamento...</p>
              </div>
            </div>
          </SectionMain>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}