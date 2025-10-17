"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { mdiOfficeBuilding, mdiMapMarker, mdiCheck, mdiRocketLaunch, mdiStar } from "@mdi/js";
import SectionMain from "../_components/Section/Main";
import CardBoxComponentBody from "../_components/CardBox/Component/Body";
import CardBoxComponentFooter from "../_components/CardBox/Component/Footer";
import FormField from "../_components/FormField";
import Icon from "../_components/Icon";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl float-slow"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl float-medium"></div>
      </div>

      <SectionMain>
        {/* Header with gradient */}
        <div className="mb-8 text-center slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4">
            <Icon path={mdiStar} size="16" className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {paymentSuccess ? "Benvenuto!" : "Ultimi passi"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {paymentSuccess ? "🎉 Pagamento Completato!" : "Configura il tuo Account"}
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Completa questi semplici passaggi per iniziare a utilizzare la piattaforma
          </p>
        </div>

        {paymentSuccess && (
          <div className="mb-8 slide-up-delay-1">
            <div className="glass-strong rounded-2xl p-6 border border-green-200 dark:border-green-800/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon path={mdiCheck} size="24" className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">Pagamento completato con successo!</p>
                  <p className="text-gray-600 dark:text-gray-300">Ora completa la configurazione per iniziare.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mb-8 slide-up-delay-1">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">1</span>
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">2</span>
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-600"></div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Icon path={mdiRocketLaunch} size="16" className="text-white" />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* Step 1 Card */}
          <div className="mb-8 slide-up-delay-2">
            <div className="glass-strong rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden hover:shadow-3xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon path={mdiOfficeBuilding} size="24" className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white/80 text-sm font-medium">Passo 1</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Informazioni Azienda</h2>
                  </div>
                </div>
              </div>
              <CardBoxComponentBody>
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
              </CardBoxComponentBody>
            </div>
          </div>

          {/* Step 2 Card */}
          <div className="mb-8 slide-up-delay-3">
            <div className="glass-strong rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden hover:shadow-3xl transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon path={mdiMapMarker} size="24" className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white/80 text-sm font-medium">Passo 2</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Prima Location</h2>
                  </div>
                </div>
              </div>
              <CardBoxComponentBody>
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
              </CardBoxComponentBody>
              <CardBoxComponentFooter>
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <Icon path={mdiCheck} size="16" className="inline mr-1 text-green-500" />
                    Tutti i campi sono obbligatori
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Salvataggio...
                        </>
                      ) : (
                        <>
                          <Icon path={mdiRocketLaunch} size="20" />
                          Completa Configurazione
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </CardBoxComponentFooter>
            </div>
          </div>
        </form>
      </SectionMain>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}