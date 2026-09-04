const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin/publicaciones/nueva/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add currentStep
content = content.replace(
    /const \[selectedUserId, setSelectedUserId\] = useState\(""\)/,
    'const [selectedUserId, setSelectedUserId] = useState("")\n  const [currentStep, setCurrentStep] = useState(1)'
);

// 2. Add handlers
const handlers = `  const validateStep = (step: number) => {
    setStatusMessage({ type: null, text: "" })
    if (step === 1) {
      if (!formData.image) return "La Foto Principal es obligatoria."
      if (!formData.title) return "Debes ingresar el Título del Producto."
      if (!formData.category) return "Selecciona una Categoría."
      if (!formData.country) return "Selecciona el País de Origen."
      if (!formData.state) return "Debes ingresar el Estado / Región."
    }
    if (step === 2) {
      if (priceType === "fixed" && !formData.price) return "Debes indicar un precio o seleccionar 'Cotización'."
      if (!formData.quantity) return "Indica la Cantidad Disponible."
      if (!formData.minOrderQuantity) return "Indica el Pedido Mínimo."
      if (!formData.supplyCapacity) return "Indica tu Capacidad de Abastecimiento."
    }
    if (step === 3) {
      if (selectedAlcance.length === 0) return "Selecciona al menos una región en tu Alcance Comercial."
    }
    if (step === 4) {
      if (formData.description.length < 50) return "La descripción debe tener al menos 50 caracteres."
    }
    return null
  }

  const handleNextStep = () => {
    const error = validateStep(currentStep)
    if (error) return setStatusMessage({ type: 'error', text: error })
    setCurrentStep((prev) => Math.min(prev + 1, 4))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePrevStep = () => {
    setStatusMessage({ type: null, text: "" })
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {`;

content = content.replace(/  const handleSubmit = async \(e: React\.FormEvent\) => \{/, handlers);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed missing handlers in admin page!');
