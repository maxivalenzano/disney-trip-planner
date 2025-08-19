"use client"

import { useEffect, useState } from "react"
import { dbKeepAlive } from "@/lib/keep-alive"

interface KeepAliveStatus {
  isActive: boolean
  lastPing: string | null
  health: "healthy" | "unhealthy" | "checking"
}

export function useKeepAlive(enabled = true, intervalHours = 12) {
  const [status, setStatus] = useState<KeepAliveStatus>({
    isActive: false,
    lastPing: null,
    health: "checking",
  })

  useEffect(() => {
    if (!enabled) return

    // Iniciar keep-alive
    dbKeepAlive.start(intervalHours)
    setStatus((prev) => ({ ...prev, isActive: true }))

    // Verificar salud inicial
    checkHealth()

    // Verificar salud cada 5 minutos
    const healthCheckInterval = setInterval(checkHealth, 5 * 60 * 1000)

    return () => {
      dbKeepAlive.stop()
      clearInterval(healthCheckInterval)
      setStatus((prev) => ({ ...prev, isActive: false }))
    }
  }, [enabled, intervalHours])

  const checkHealth = async () => {
    const health = await dbKeepAlive.checkHealth()
    setStatus((prev) => ({
      ...prev,
      health: health.status,
      lastPing: health.timestamp,
    }))
  }

  const manualPing = async () => {
    setStatus((prev) => ({ ...prev, health: "checking" }))
    const success = await dbKeepAlive.ping()
    setStatus((prev) => ({
      ...prev,
      health: success ? "healthy" : "unhealthy",
      lastPing: new Date().toISOString(),
    }))
    return success
  }

  return {
    status,
    manualPing,
    checkHealth,
  }
}
