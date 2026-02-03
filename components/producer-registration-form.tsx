"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, ChevronRight, ChevronLeft } from 'lucide-react'

interface FormData {
  // Company Information
  companyName: string
  address: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  country: string
  legalStructure: string
  businessNature: string
  vatId: string
  annualRevenue: string
  yearsInOperation: string
  hasSubsidiaries: string
  subsidiariesNames: string

  // Documents
  certificateOfIncorporation: File | null
  financialStatement: File | null

  // Primary Contact
  contactName: string
  contactEmail: string
  contactPhone: string
  contactPassport: File | null

  // Bank Information
  bankName: string
  bankAddress: string
  bankAddressLine2: string
  bankCity: string
  bankState: string
  bankZipCode: string
  bankCountry: string
  bankOfficerName: string
  bankOfficerEmail: string
  ibanNumber: string
  swiftCode: string
  accountConfirmation: File | null
}

export function ProducerRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    legalStructure: "",
    businessNature: "",
    vatId: "",
    annualRevenue: "",
    yearsInOperation: "",
    hasSubsidiaries: "no",
    subsidiariesNames: "",
    certificateOfIncorporation: null,
    financialStatement: null,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactPassport: null,
    bankName: "",
    bankAddress: "",
    bankAddressLine2: "",
    bankCity: "",
    bankState: "",
    bankZipCode: "",
    bankCountry: "",
    bankOfficerName: "",
    bankOfficerEmail: "",
    ibanNumber: "",
    swiftCode: "",
    accountConfirmation: null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }))
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    alert("¡Solicitud enviada! Te contactaremos pronto para verificar tu información.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step <= currentStep ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${step < currentStep ? "bg-primary" : "bg-border"}`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Empresa</span>
            <span>Documentos</span>
            <span>Contacto</span>
            <span>Banco</span>
          </div>
        </div>

        <Card className="p-8 bg-card border-border shadow-lg">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Información de la Empresa</h2>
                  <p className="text-muted-foreground">Cuéntanos sobre tu empresa agrícola</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre de la Empresa <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Ej: Agro Colombia S.A."
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Dirección <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Calle, número"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Línea de Dirección 2</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Apartamento, suite, etc."
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Ciudad <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Ciudad"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Departamento/Región <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Departamento"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Código Postal <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="Código postal"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      País <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="País"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Estructura Legal del Negocio <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="legalStructure"
                    value={formData.legalStructure}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="sole-proprietorship">Empresa Individual</option>
                    <option value="partnership">Asociación</option>
                    <option value="llc">Sociedad de Responsabilidad Limitada</option>
                    <option value="corporation">Corporación</option>
                    <option value="seller">Vendedor Agrícola</option>
                    <option value="other">Otra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Naturaleza del Negocio <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="businessNature"
                    value={formData.businessNature}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="trading">Comercio</option>
                    <option value="end-user">Usuario Final</option>
                    <option value="producer">Productor Agrícola</option>
                    <option value="service-provider">Proveedor de Servicios</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Número VAT/ID <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="vatId"
                    value={formData.vatId}
                    onChange={handleInputChange}
                    placeholder="Ej: XX-XXXXXXXX"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ingresos Anuales <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="annualRevenue"
                    value={formData.annualRevenue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  >
                    <option value="">Selecciona un rango</option>
                    <option value="less-50k">Menos de $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="100k-500k">$100,000 - $500,000</option>
                    <option value="500k-1m">$500,000 - $1,000,000</option>
                    <option value="1m-5m">$1,000,000 - $5,000,000</option>
                    <option value="5m-10m">$5,000,000 - $10,000,000</option>
                    <option value="10m-50m">$10,000,000 - $50,000,000</option>
                    <option value="more-50m">Más de $50,000,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Años de Operación <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    name="yearsInOperation"
                    value={formData.yearsInOperation}
                    onChange={handleInputChange}
                    placeholder="Ej: 5"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ¿Tiene subsidiarias o empresas afiliadas? <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="hasSubsidiaries"
                    value={formData.hasSubsidiaries}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                    <option value="no">No</option>
                    <option value="yes">Sí</option>
                  </select>
                </div>

                {formData.hasSubsidiaries === "yes" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nombres de las Subsidiarias <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      name="subsidiariesNames"
                      value={formData.subsidiariesNames}
                      onChange={handleInputChange}
                      placeholder="Lista los nombres de tus subsidiarias o empresas afiliadas"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                      rows={3}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Documents */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Documentos</h2>
                  <p className="text-muted-foreground">Sube los documentos requeridos</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Certificado de Constitución <span className="text-destructive">*</span>
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, "certificateOfIncorporation")}
                      className="hidden"
                      id="cert-upload"
                      required
                    />
                    <label htmlFor="cert-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Haz clic para subir</p>
                      <p className="text-xs text-muted-foreground">Soporta imágenes y PDF</p>
                      {formData.certificateOfIncorporation && (
                        <p className="text-xs text-primary mt-2">{formData.certificateOfIncorporation.name}</p>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Estados Financieros / Auditoría Anual <span className="text-destructive">*</span>
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, "financialStatement")}
                      className="hidden"
                      id="financial-upload"
                      required
                    />
                    <label htmlFor="financial-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Haz clic para subir</p>
                      <p className="text-xs text-muted-foreground">Soporta imágenes y PDF</p>
                      {formData.financialStatement && (
                        <p className="text-xs text-primary mt-2">{formData.financialStatement.name}</p>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Primary Contact */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Contacto Principal</h2>
                  <p className="text-muted-foreground">Información de la persona de contacto autorizada</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre Completo <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    placeholder="Nombre del contacto"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Correo Electrónico <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="contacto@empresa.com"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Teléfono <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Pasaporte del Contacto <span className="text-destructive">*</span>
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "contactPassport")}
                      className="hidden"
                      id="passport-upload"
                      required
                    />
                    <label htmlFor="passport-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Haz clic para subir</p>
                      <p className="text-xs text-muted-foreground">Solo imágenes</p>
                      {formData.contactPassport && (
                        <p className="text-xs text-primary mt-2">{formData.contactPassport.name}</p>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Bank Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Información Bancaria</h2>
                  <p className="text-muted-foreground">Detalles de tu cuenta bancaria para transacciones</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre del Banco <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Ej: Banco Nacional"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Dirección del Banco <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankAddress"
                    value={formData.bankAddress}
                    onChange={handleInputChange}
                    placeholder="Calle, número"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Línea de Dirección 2</label>
                  <input
                    type="text"
                    name="bankAddressLine2"
                    value={formData.bankAddressLine2}
                    onChange={handleInputChange}
                    placeholder="Oficina, suite, etc."
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Ciudad <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankCity"
                      value={formData.bankCity}
                      onChange={handleInputChange}
                      placeholder="Ciudad"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Departamento/Región <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankState"
                      value={formData.bankState}
                      onChange={handleInputChange}
                      placeholder="Departamento"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Código Postal <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankZipCode"
                      value={formData.bankZipCode}
                      onChange={handleInputChange}
                      placeholder="Código postal"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      País <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankCountry"
                      value={formData.bankCountry}
                      onChange={handleInputChange}
                      placeholder="País"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre del Oficial Bancario <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankOfficerName"
                    value={formData.bankOfficerName}
                    onChange={handleInputChange}
                    placeholder="Nombre del oficial"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email del Oficial Bancario <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    name="bankOfficerEmail"
                    value={formData.bankOfficerEmail}
                    onChange={handleInputChange}
                    placeholder="oficial@banco.com"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    IBAN o Número de Cuenta <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="ibanNumber"
                    value={formData.ibanNumber}
                    onChange={handleInputChange}
                    placeholder="IBAN o número de cuenta"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Código SWIFT, ABA o de Enrutamiento <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleInputChange}
                    placeholder="SWIFT, ABA o código de enrutamiento"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirmación de Cuenta <span className="text-destructive">*</span>
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "accountConfirmation")}
                      className="hidden"
                      id="account-upload"
                      required
                    />
                    <label htmlFor="account-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Haz clic para subir</p>
                      <p className="text-xs text-muted-foreground">Solo imágenes</p>
                      {formData.accountConfirmation && (
                        <p className="text-xs text-primary mt-2">{formData.accountConfirmation.name}</p>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 mt-8 pt-8 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              {currentStep === 4 ? (
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                >
                  Enviar Solicitud
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Información importante:</span> Todos los campos marcados con * son
            obligatorios. Tu información será verificada antes de activar tu cuenta como vendedor. El proceso
            típicamente toma entre 3-5 días hábiles.
          </p>
        </div>
      </div>
    </div>
  )
}
