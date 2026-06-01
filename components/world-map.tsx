"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line
} from "react-simple-maps"

// Un topojson ligero de los continentes y países
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export function WorldMap() {
  // Coordenadas ajustadas: Restaurando USA y otros puntos
  const markers: Array<{name: string, coordinates: [number, number], size: number, delay: number}> = [
    { name: "USA", coordinates: [-95, 38], size: 6, delay: 0 },
    { name: "Mexico", coordinates: [-102, 23], size: 5, delay: 0.2 },
    { name: "ElSalvador", coordinates: [-89, 13], size: 6, delay: 0.4 },
    { name: "Colombia", coordinates: [-74, 4], size: 5, delay: 0.6 },
    { name: "Brazil", coordinates: [-50, -10], size: 6, delay: 0.8 },
    { name: "Argentina", coordinates: [-65, -35], size: 5, delay: 1.0 },
    { name: "EU_west", coordinates: [-5, 45], size: 5, delay: 1.2 },       // España/Francia
    { name: "EU_central", coordinates: [15, 50], size: 6, delay: 1.4 },    
    { name: "AF_west", coordinates: [0, 10], size: 5, delay: 1.6 },        
    { name: "ME", coordinates: [45, 25], size: 6, delay: 1.8 },            
    { name: "India", coordinates: [78, 20], size: 5, delay: 2.0 },         
    { name: "Singapore", coordinates: [103, 1], size: 5, delay: 2.2 },     
    { name: "China", coordinates: [110, 35], size: 7, delay: 2.4 },        
    { name: "Japan", coordinates: [138, 36], size: 6, delay: 2.6 },        
    { name: "Oceania", coordinates: [135, -25], size: 5, delay: 2.8 },     
  ]

  const lines: Array<{from: [number, number], to: [number, number]}> = [
    { from: [-95, 38], to: [-102, 23] }, // USA -> MX
    { from: [-102, 23], to: [-89, 13] }, // MX -> ESA
    { from: [-89, 13], to: [-74, 4] },   // ESA -> COL
    { from: [-74, 4], to: [-50, -10] },  // COL -> BR
    { from: [-50, -10], to: [-65, -35] },// BR -> ARG
    
    // Conexiones intercontinentales base
    { from: [-95, 38], to: [-5, 45] },   // USA -> EU_west
    { from: [-102, 23], to: [-5, 45] },  // MX -> EU_west
    { from: [-89, 13], to: [-5, 45] },   // ESA -> EU_west
    { from: [-5, 45], to: [15, 50] },    // EU_west -> EU_central
    { from: [15, 50], to: [0, 10] },     // EU_central -> AF_west
    { from: [15, 50], to: [45, 25] },    // EU_central -> ME
    
    { from: [45, 25], to: [78, 20] },    // ME -> IN
    { from: [78, 20], to: [103, 1] },    // IN -> SGP
    { from: [103, 1], to: [110, 35] },   // SGP -> CHN
    { from: [110, 35], to: [138, 36] },  // CHN -> JPN
    { from: [103, 1], to: [135, -25] },  // SGP -> AUS
  ]

  // Ahora *todos* los nodos tienen al menos una línea animada
  const animatedJumpLines: Array<{from: [number, number], to: [number, number], delay: number}> = [
    { from: [-89, 13], to: [110, 35], delay: 0 },          // El Salvador -> China 
    { from: [-74, 4], to: [-95, 38], delay: 0.5 },         // Colombia -> USA
    { from: [-50, -10], to: [15, 50], delay: 1 },          // Brasil -> Europa Central
    { from: [-102, 23], to: [138, 36], delay: 1.5 },       // México -> Japón
    { from: [-89, 13], to: [-5, 45], delay: 2 },           // El Salvador -> Europa Occidental
    { from: [-65, -35], to: [0, 10], delay: 2.5 },         // Argentina -> África
    { from: [78, 20], to: [45, 25], delay: 3 },            // India -> Medio Oriente
    { from: [-5, 45], to: [-50, -10], delay: 3.5 },        // Europa Occidental -> Brasil
    { from: [15, 50], to: [103, 1], delay: 1.2 },          // Europa Central -> Singapur
    { from: [45, 25], to: [135, -25], delay: 0.8 },        // Medio Oriente -> Australia
    { from: [110, 35], to: [78, 20], delay: 4 },           // China -> India
    { from: [138, 36], to: [135, -25], delay: 2.8 },       // Japón -> Australia
    { from: [103, 1], to: [-89, 13], delay: 4.5 },         // Singapur -> El Salvador
    { from: [0, 10], to: [-74, 4], delay: 5.0 },           // África -> Colombia
    { from: [-95, 38], to: [103, 1], delay: 1.8 },         // USA -> Singapur
  ]

  return (
    <div className="relative w-full max-w-none w-[180%] md:w-[220%] ml-0 md:ml-[15%] flex items-center justify-end p-0 -mt-16 overflow-visible pointer-events-none">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 600, // Escandalosamente grande
          center: [20, 20] // Centro ajustado al norte
        }}
        width={2400} // Lienzo extendido
        height={1300} // Lienzo alto
        className="w-full h-auto opacity-95 drop-shadow-[0_20px_20px_rgba(0,0,0,0.08)] overflow-visible"
      >
        {/* Renderizado de geografías/países */}
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies
              // 010: Antártida oculta, USA se muestra normalmente
              .filter((geo) => geo.id !== "010") 
              .map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#f4f4f5" 
                  stroke="#f4f4f5" 
                  strokeWidth={1}
                  strokeLinejoin="round" 
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#e4e4e7", outline: "none", transition: "all 0.3s" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
          }
        </Geographies>

        {/* Líneas estáticas de conexión pálidas (Agrandadas) */}
        {lines.map((line, i) => (
          <Line
            key={i}
            from={line.from}
            to={line.to}
            stroke="#f1f5f9"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}

        {/* Líneas de animación cursivas (vuelos/transferencias) - MÁS GRUESAS Y EN TODOS LOS PUNTOS */}
        {animatedJumpLines.map((line, i) => (
          <Line
            key={`anim-${i}`}
            from={line.from}
            to={line.to}
            stroke="#10b981" 
            strokeWidth={7} // Rayos super gruesos
            strokeLinecap="round"
            style={{
               strokeDasharray: "30 1400", // Trazo luz mucho más largo
               animation: `dash-jump 4.5s ease-in-out infinite ${line.delay}s`
            }}
          />
        ))}

        {/* CSS para la animación */}
        <defs>
          <style>
            {`
              @keyframes dash-jump {
                0% { stroke-dashoffset: 1400; opacity: 0; }
                5% { opacity: 1; }
                50% { stroke-dashoffset: 0; opacity: 1; }
                60% { opacity: 0; }
                100% { stroke-dashoffset: 0; opacity: 0; }
              }
            `}
          </style>
        </defs>

        {/* Nodos interactivos MÁS GRANDES */}
        {markers.map(({ name, coordinates, size, delay }) => (
          <Marker key={name} coordinates={coordinates}>
            {/* Efecto de pulso con framer-motion (Agrandado mucho más) */}
            <motion.circle
              r={size * 8} // Radio de pulso colosal
              fill="#10b981" 
              opacity="0.25"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1, 1.6, 1], opacity: [0.25, 0.02, 0.25] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut",
              }}
            />
            {/* Punto principal sólido (MÁS GRANDE) */}
            <motion.circle
              r={size * 4} // Radio interno robusto
              fill="#10b981" 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: delay,
              }}
              style={{ filter: "drop-shadow(0 5px 10px rgba(16,185,129,0.7))" }}
            />
          </Marker>
        ))}

        {/* Punto específico destacado (El Salvador) como hub central COLOSAL */}
        <Marker coordinates={[-89, 13]}>
          <motion.circle
            r={24} // Era 16
            fill="#ffffff"
            stroke="#10b981"
            strokeWidth={6} // Borde gruesísimo
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ filter: "drop-shadow(0 5px 25px rgba(16,185,129,0.5))" }}
          />
        </Marker>
      </ComposableMap>
    </div>
  )
}
