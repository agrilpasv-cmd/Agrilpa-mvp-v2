import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Send, MoreVertical, Phone, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ConstructionOverlay from "@/components/dashboard/construction-overlay"

export default function MensajesPage() {
  return (
    <ConstructionOverlay>
      <div className="flex h-[calc(100vh-8rem)] w-full flex-col rounded-lg border bg-background shadow-sm lg:flex-row">
        {/* Sidebar - Lista de contactos */}
        <div className="flex w-full flex-col border-r lg:w-80">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar mensajes..."
                className="pl-8 bg-muted/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-1 p-2">
              {[
                { name: "Juan Pérez", msg: "Hola, ¿está disponible el producto?", time: "10:30 AM", active: true, unread: 2 },
                { name: "María Garcia", msg: "Gracias por la información", time: "Ayer", active: false, unread: 0 },
                { name: "Carlos López", msg: "Me interesa el lote de maíz", time: "Lun", active: false, unread: 0 },
                { name: "Ana Martínez", msg: "¿Cuándo sería la entrega?", time: "Dom", active: false, unread: 0 },
                { name: "Pedro Sánchez", msg: "Confirmado el pago", time: "Semana pasada", active: false, unread: 0 },
              ].map((chat, i) => (
                <button
                  key={i}
                  className={`flex items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-accent/50 ${chat.active ? "bg-accent" : ""
                    }`}
                >
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={`/placeholder-user-${i}.jpg`} alt={chat.name} />
                    <AvatarFallback>{chat.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{chat.name}</span>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{chat.msg}</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {chat.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border">
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">Juan Pérez</h3>
                <p className="text-xs text-muted-foreground">En línea hace 5 min</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-muted px-4 py-2 text-sm">
                Hola, estoy interesado en el lote de semillas que publicaste.
              </div>
              <span className="ml-2 self-end text-xs text-muted-foreground">10:30 AM</span>
            </div>

            <div className="flex justify-end">
              <span className="mr-2 self-end text-xs text-muted-foreground">10:32 AM</span>
              <div className="max-w-[80%] rounded-2xl rounded-tr-none bg-primary px-4 py-2 text-sm text-primary-foreground">
                ¡Hola Juan! Claro, todavía está disponible. ¿Cuántas toneladas necesitas?
              </div>
            </div>

            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-muted px-4 py-2 text-sm">
                Necesitaría unas 5 toneladas para empezar. ¿Haces envíos a Santa Cruz?
              </div>
              <span className="ml-2 self-end text-xs text-muted-foreground">10:33 AM</span>
            </div>

            <div className="flex justify-end">
              <span className="mr-2 self-end text-xs text-muted-foreground">10:35 AM</span>
              <div className="max-w-[80%] rounded-2xl rounded-tr-none bg-primary px-4 py-2 text-sm text-primary-foreground">
                Sí, hacemos envíos a todo el país. El costo del flete dependería de la ubicación exacta.
              </div>
            </div>

            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-muted px-4 py-2 text-sm">
                Perfecto, déjame revisar y te confirmo más tarde.
              </div>
              <span className="ml-2 self-end text-xs text-muted-foreground">10:36 AM</span>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-muted/50 border-0 focus-visible:ring-1"
              />
              <Button size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ConstructionOverlay>
  )
}
