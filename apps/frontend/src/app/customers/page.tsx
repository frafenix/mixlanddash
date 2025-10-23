"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Checkbox from "@/components/form/input/Checkbox";
import Tabs from "@/components/ui/tabs/Tabs";
import { PencilIcon, TrashBinIcon, EyeIcon } from "@/icons/index";
import { contactsService, type Anagrafica } from "@/services/contacts";
import { logDebug, logInfo, logWarn, logError } from "@/utils/logger";

const sampleCustomers: Anagrafica[] = [
  {
    id: 1,
    nome: "Mario",
    cognome: "Rossi",
    ragioneSociale: "Rossi SRL",
    codiceFiscale: "RSSMRA80A01H501Z",
    partitaIva: "12345678901",
    indirizzo: "Via Roma 123",
    cap: "00100",
    citta: "Roma",
    provincia: "RM",
    nazione: "Italia",
    telefono: "06-12345678",
    cellulare: "333-1234567",
    email: "mario.rossi@email.com",
    pec: "mario.rossi@pec.it",
    sito: "www.rossisrl.it",
    codiceDestinatario: "ABCDEFG",
    iban: "IT60 X054 2811 1010 0000 0123 456",
    banca: "Banca Intesa",
    agenzia: "Roma Centro",
    swift: "BCITITMM",
    note: "Cliente importante",
    cliente: true,
    fornitore: false,
    vettore: false,
    agente: false,
    dataCreazione: "2024-01-15",
    dataModifica: "2024-01-15"
  },
  {
    id: 2,
    nome: "Giulia",
    cognome: "Verdi",
    ragioneSociale: "",
    codiceFiscale: "VRDGLI85B15F205X",
    partitaIva: "",
    indirizzo: "Via Milano 456",
    cap: "20100",
    citta: "Milano",
    provincia: "MI",
    nazione: "Italia",
    telefono: "02-87654321",
    cellulare: "347-7654321",
    email: "giulia.verdi@email.com",
    pec: "",
    sito: "",
    codiceDestinatario: "",
    iban: "",
    banca: "",
    agenzia: "",
    swift: "",
    note: "Cliente privato",
    cliente: true,
    fornitore: true,
    vettore: false,
    agente: false,
    dataCreazione: "2024-01-20",
    dataModifica: "2024-01-20"
  }
];

const emptyCustomer: Partial<Anagrafica> = {
  nome: "",
  cognome: "",
  ragioneSociale: "",
  codiceFiscale: "",
  partitaIva: "",
  indirizzo: "",
  cap: "",
  citta: "",
  provincia: "",
  nazione: "",
  telefono: "",
  cellulare: "",
  email: "",
  pec: "",
  sito: "",
  codiceDestinatario: "",
  iban: "",
  banca: "",
  agenzia: "",
  swift: "",
  note: "",
  cliente: false,
  fornitore: false,
  vettore: false,
  agente: false,
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Anagrafica[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Anagrafica[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Anagrafica | null>(null);
  const [formData, setFormData] = useState<Partial<Anagrafica>>(emptyCustomer);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Carica i clienti dal backend all'avvio
  useEffect(() => {
    loadCustomers();
  }, []);

  // Filtra i clienti quando cambia il termine di ricerca
  useEffect(() => {
    const filtered = filterCustomers(customers, searchTerm);
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  const loadCustomers = async () => {
    try {
      logInfo("Caricamento clienti iniziato", "CustomersPage");
      setLoading(true);
      const data = await contactsService.getAllContacts();
      setCustomers(data);
      logInfo(`Caricati ${data.length} clienti con successo`, "CustomersPage");
    } catch (error) {
      logError("Errore durante il caricamento dei clienti", "CustomersPage", error);
      logWarn("Utilizzo dati di esempio a causa dell'errore", "CustomersPage");
      setCustomers(sampleCustomers);
    } finally {
      setLoading(false);
    }
  };

  // Funzione di ricerca fuzzy
  const fuzzySearch = (text: string, searchTerm: string): boolean => {
    if (!searchTerm) return true;
    
    const normalizeText = (str: string) => 
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const normalizedText = normalizeText(text);
    const normalizedSearch = normalizeText(searchTerm);
    
    // Ricerca esatta
    if (normalizedText.includes(normalizedSearch)) return true;
    
    // Ricerca fuzzy semplice - permette caratteri mancanti
    let searchIndex = 0;
    for (let i = 0; i < normalizedText.length && searchIndex < normalizedSearch.length; i++) {
      if (normalizedText[i] === normalizedSearch[searchIndex]) {
        searchIndex++;
      }
    }
    return searchIndex === normalizedSearch.length;
  };

  // Filtra i clienti in base al termine di ricerca
  const filterCustomers = (customers: Anagrafica[], searchTerm: string): Anagrafica[] => {
    if (!searchTerm.trim()) return customers;
    
    return customers.filter(customer => {
      const searchFields = [
        customer.ragioneSociale || '',
        customer.nome || '',
        customer.cognome || '',
        customer.codiceFiscale || '',
        customer.partitaIva || '',
        customer.codiceDestinatario || '',
        customer.email || '',
        customer.telefono || '',
        customer.cellulare || ''
      ];
      
      return searchFields.some(field => fuzzySearch(field, searchTerm));
    });
  };

  const openModal = (customer?: Anagrafica) => {
    logDebug("Apertura modale", "CustomersPage", { editMode: !!customer });
    if (customer) {
      setEditingCustomer(customer);
      setFormData(customer);
      logInfo(`Modifica cliente: ${customer.nome} ${customer.cognome}`, "CustomersPage");
    } else {
      setEditingCustomer(null);
      setFormData(emptyCustomer);
      logInfo("Creazione nuovo cliente", "CustomersPage");
    }
    setIsModalOpen(true);
    setErrors({});
  };

  const resetForm = () => {
    logDebug("Reset form e chiusura modale", "CustomersPage");
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData(emptyCustomer);
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.nome?.trim()) {
      newErrors.nome = "Il nome è obbligatorio";
    }
    
    if (!formData.cognome?.trim()) {
      newErrors.cognome = "Il cognome è obbligatorio";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      logWarn("Validazione form fallita", "CustomersPage", errors);
      return;
    }

    setLoading(true);
    try {
      if (editingCustomer) {
        // Aggiorna cliente esistente
        logInfo(`Aggiornamento cliente ID: ${editingCustomer.id}`, "CustomersPage");
        const updatedCustomer = await contactsService.updateContact(editingCustomer.id, formData);
        
        if (updatedCustomer) {
          setCustomers(prev => prev.map(customer => 
            customer.id === editingCustomer.id ? updatedCustomer : customer
          ));
          logInfo("Cliente aggiornato con successo", "CustomersPage");
        }
      } else {
        // Crea nuovo cliente
        logInfo("Creazione nuovo cliente", "CustomersPage");
        const newCustomer = await contactsService.createContact(formData);
        
        if (newCustomer) {
          setCustomers(prev => [...prev, newCustomer]);
          logInfo("Nuovo cliente creato con successo", "CustomersPage");
        }
      }
      
      resetForm();
    } catch (error) {
      logError("Errore durante il salvataggio del cliente", "CustomersPage", error);
      alert('Errore nel salvataggio del cliente. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: number) => {
    if (confirm("Sei sicuro di voler eliminare questo cliente?")) {
      setLoading(true);
      try {
        logInfo(`Eliminazione cliente ID: ${id}`, "CustomersPage");
        const success = await contactsService.deleteContact(id);
        if (success) {
          setCustomers(prev => prev.filter(customer => customer.id !== id));
          logInfo("Cliente eliminato con successo", "CustomersPage");
        } else {
          logError("Errore durante l'eliminazione del cliente - operazione fallita", "CustomersPage");
          alert('Errore nell\'eliminazione del cliente. Riprova.');
        }
      } catch (error) {
        logError("Errore durante l'eliminazione del cliente", "CustomersPage", error);
        alert('Errore nell\'eliminazione del cliente. Riprova.');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderPersonalInfoTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input
            type="text"
            id="nome"
            name="nome"
            placeholder="Inserisci nome"
            defaultValue={formData.nome || ""}
            onChange={handleInputChange}
            error={!!errors.nome}
            className={errors.nome ? "border-red-500" : ""}
          />
          {errors.nome && <span className="text-red-500 text-sm">{errors.nome}</span>}
        </div>

        <div>
          <Label htmlFor="cognome">Cognome *</Label>
          <Input
            type="text"
            id="cognome"
            name="cognome"
            placeholder="Inserisci cognome"
            defaultValue={formData.cognome || ""}
            onChange={handleInputChange}
            error={!!errors.cognome}
            className={errors.cognome ? "border-red-500" : ""}
          />
          {errors.cognome && <span className="text-red-500 text-sm">{errors.cognome}</span>}
        </div>

        <div>
          <Label htmlFor="ragioneSociale">Ragione Sociale</Label>
          <Input
            type="text"
            id="ragioneSociale"
            name="ragioneSociale"
            placeholder="Inserisci ragione sociale"
            defaultValue={formData.ragioneSociale || ""}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="codiceFiscale">Codice Fiscale</Label>
          <Input
            type="text"
            id="codiceFiscale"
            name="codiceFiscale"
            placeholder="Inserisci codice fiscale"
            defaultValue={formData.codiceFiscale || ""}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="partitaIva">Partita IVA</Label>
          <Input
            type="text"
            id="partitaIva"
            name="partitaIva"
            placeholder="Inserisci partita IVA"
            defaultValue={formData.partitaIva || ""}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipologiaCliente">Tipologia Cliente</Label>
          <Select
            options={[
              { value: "cliente", label: "Cliente" },
              { value: "fornitore", label: "Fornitore" },
              { value: "cliente_fornitore", label: "Cliente e Fornitore" }
            ]}
            placeholder="Seleziona tipologia"
            defaultValue={
              formData.cliente && formData.fornitore ? "cliente_fornitore" :
              formData.cliente ? "cliente" :
              formData.fornitore ? "fornitore" :
              ""
            }
            onChange={(value) => {
              const updates = {
                cliente: false,
                fornitore: false,
                vettore: false,
                agente: false
              };
              
              switch (value) {
                case "cliente":
                  updates.cliente = true;
                  break;
                case "fornitore":
                  updates.fornitore = true;
                  break;
                case "cliente_fornitore":
                  updates.cliente = true;
                  updates.fornitore = true;
                  break;
              }
              
              setFormData(prev => ({ ...prev, ...updates }));
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderAddressTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Label htmlFor="indirizzo">Indirizzo</Label>
        <Input
          type="text"
          id="indirizzo"
          name="indirizzo"
          placeholder="Inserisci indirizzo"
          defaultValue={formData.indirizzo || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="cap">CAP</Label>
        <Input
          type="text"
          id="cap"
          name="cap"
          placeholder="Inserisci CAP"
          defaultValue={formData.cap || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="citta">Città</Label>
        <Input
          type="text"
          id="citta"
          name="citta"
          placeholder="Inserisci città"
          defaultValue={formData.citta || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="provincia">Provincia</Label>
        <Input
          type="text"
          id="provincia"
          name="provincia"
          placeholder="Inserisci provincia"
          defaultValue={formData.provincia || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="nazione">Nazione</Label>
        <Input
          type="text"
          id="nazione"
          name="nazione"
          placeholder="Inserisci nazione"
          defaultValue={formData.nazione || ""}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="telefono">Telefono</Label>
        <Input
          type="tel"
          id="telefono"
          name="telefono"
          placeholder="Inserisci telefono"
          defaultValue={formData.telefono || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="cellulare">Cellulare</Label>
        <Input
          type="tel"
          id="cellulare"
          name="cellulare"
          placeholder="Inserisci cellulare"
          defaultValue={formData.cellulare || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="Inserisci email"
          defaultValue={formData.email || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="pec">PEC</Label>
        <Input
          type="email"
          id="pec"
          name="pec"
          placeholder="Inserisci PEC"
          defaultValue={formData.pec || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="sito">Sito Web</Label>
        <Input
          type="url"
          id="sito"
          name="sito"
          placeholder="Inserisci sito web"
          defaultValue={formData.sito || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="codiceDestinatario">Codice Destinatario</Label>
        <Input
          type="text"
          id="codiceDestinatario"
          name="codiceDestinatario"
          placeholder="Inserisci codice destinatario"
          defaultValue={formData.codiceDestinatario || ""}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );

  const renderBankingTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Label htmlFor="iban">IBAN</Label>
        <Input
          type="text"
          id="iban"
          name="iban"
          placeholder="Inserisci IBAN"
          defaultValue={formData.iban || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="banca">Banca</Label>
        <Input
          type="text"
          id="banca"
          name="banca"
          placeholder="Inserisci banca"
          defaultValue={formData.banca || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="agenzia">Agenzia</Label>
        <Input
          type="text"
          id="agenzia"
          name="agenzia"
          placeholder="Inserisci agenzia"
          defaultValue={formData.agenzia || ""}
          onChange={handleInputChange}
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="swift">Codice SWIFT</Label>
        <Input
          type="text"
          id="swift"
          name="swift"
          placeholder="Inserisci codice SWIFT"
          defaultValue={formData.swift || ""}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="note">Note</Label>
        <TextArea
          placeholder="Inserisci note aggiuntive sul cliente..."
          value={formData.note || ""}
          onChange={(value) => setFormData(prev => ({ ...prev, note: value }))}
          rows={8}
        />
      </div>
    </div>
  );

  const formTabs = [
    {
      id: "personal",
      label: "Dati Personali",
      content: renderPersonalInfoTab()
    },
    {
      id: "address",
      label: "Indirizzo",
      content: renderAddressTab()
    },
    {
      id: "contact",
      label: "Contatti",
      content: renderContactTab()
    },
    {
      id: "banking",
      label: "Dati Bancari",
      content: renderBankingTab()
    },
    {
      id: "notes",
      label: "Note",
      content: renderNotesTab()
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestione Clienti</h1>
        <Button 
          onClick={() => openModal()} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          {loading ? 'Caricamento...' : 'Aggiungi Cliente'}
        </Button>
      </div>

      {/* Campo di ricerca */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Cerca clienti per nome, ragione sociale, partita IVA, codice fiscale, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 pl-10 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Trovati {filteredCustomers.length} clienti su {customers.length}
          </div>
        )}
      </div>

      {loading && customers.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500 dark:text-gray-400">Caricamento clienti...</div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700">
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nome
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Telefono
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Città
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stato
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Azioni
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(searchTerm ? filteredCustomers : customers).map((customer) => (
                <TableRow key={customer.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {customer.nome} {customer.cognome}
                    </div>
                    {customer.ragioneSociale && (
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {customer.ragioneSociale}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {customer.email}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {customer.telefono || customer.cellulare}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {customer.citta}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.attivo 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {customer.attivo ? 'Attivo' : 'Inattivo'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        onClick={() => openModal(customer)}
                        title="Modifica"
                        disabled={loading}
                      >
                        <PencilIcon />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded-md transition-colors"
                        onClick={() => console.log('Visualizza anteprima', customer)}
                        title="Visualizza anteprima"
                        disabled={loading}
                      >
                        <EyeIcon />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        onClick={() => deleteCustomer(customer.id)}
                        title="Elimina"
                        disabled={loading}
                      >
                        <TrashBinIcon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal with Tabs */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        className="max-w-4xl p-6"
      >
        <div>
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            {editingCustomer ? "Modifica Cliente" : "Nuovo Cliente"}
          </h2>

          <form onSubmit={handleSubmit}>
            <Tabs tabs={formTabs} defaultTab="personal" />

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-600">
              <Button variant="outline" onClick={resetForm} disabled={loading}>
                Annulla
              </Button>
              <Button 
                onClick={() => handleSubmit({} as React.FormEvent)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {loading ? 'Salvando...' : (editingCustomer ? "Aggiorna" : "Salva")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}