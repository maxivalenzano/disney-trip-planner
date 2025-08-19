/**
 * Cliente para mantener la base de datos activa
 */
export class DatabaseKeepAlive {
  private static instance: DatabaseKeepAlive
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  private constructor() {}

  static getInstance(): DatabaseKeepAlive {
    if (!DatabaseKeepAlive.instance) {
      DatabaseKeepAlive.instance = new DatabaseKeepAlive()
    }
    return DatabaseKeepAlive.instance
  }

  /**
   * Inicia el keep-alive automático (solo en cliente)
   * @param intervalHours Intervalo en horas (por defecto 12 horas)
   */
  start(intervalHours = 12): void {
    if (typeof window === "undefined") {
      console.warn("Keep-alive solo funciona en el cliente")
      return
    }

    if (this.isRunning) {
      console.log("Keep-alive ya está ejecutándose")
      return
    }

    const intervalMs = intervalHours * 60 * 60 * 1000 // Convertir horas a milisegundos

    this.intervalId = setInterval(async () => {
      await this.ping()
    }, intervalMs)

    this.isRunning = true
    console.log(`Keep-alive iniciado: cada ${intervalHours} horas`)

    // Ejecutar inmediatamente la primera vez
    this.ping()
  }

  /**
   * Detiene el keep-alive automático
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.isRunning = false
      console.log("Keep-alive detenido")
    }
  }

  /**
   * Realiza un ping manual a la base de datos
   */
  async ping(): Promise<boolean> {
    try {
      const response = await fetch("/api/keep-alive", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log("✅ Keep-alive exitoso:", result.timestamp)
        return true
      } else {
        console.error("❌ Keep-alive falló:", result.error)
        return false
      }
    } catch (error) {
      console.error("❌ Error en keep-alive:", error)
      return false
    }
  }

  /**
   * Verifica el estado de la base de datos
   */
  async checkHealth(): Promise<{
    status: "healthy" | "unhealthy"
    database: "connected" | "disconnected"
    timestamp: string
  }> {
    try {
      const response = await fetch("/api/health")
      const result = await response.json()
      return result
    } catch (error) {
      return {
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      }
    }
  }

  get status(): { isRunning: boolean; intervalId: NodeJS.Timeout | null } {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId,
    }
  }
}

// Instancia singleton
export const dbKeepAlive = DatabaseKeepAlive.getInstance()
