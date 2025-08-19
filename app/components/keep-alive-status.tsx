"use client"

import { useState } from "react"
import { Wifi, WifiOff, RefreshCw, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useKeepAlive } from "@/app/hooks/use-keep-alive"

interface KeepAliveStatusProps {
  className?: string
  showDetails?: boolean
}

export function KeepAliveStatus({ className, showDetails = false }: KeepAliveStatusProps) {
  const { status, manualPing, checkHealth } = useKeepAlive(true, 12)
  const [isManualPinging, setIsManualPinging] = useState(false)

  const handleManualPing = async () => {
    setIsManualPinging(true)
    try {
      await manualPing()
    } finally {
      setIsManualPinging(false)
    }
  }

  const getStatusIcon = () => {
    switch (status.health) {
      case "healthy":
        return <Wifi className="w-4 h-4 text-green-500" />
      case "unhealthy":
        return <WifiOff className="w-4 h-4 text-red-500" />
      case "checking":
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = () => {
    switch (status.health) {
      case "healthy":
        return (
          <Badge variant="default" className="bg-green-500">
            Conectado
          </Badge>
        )
      case "unhealthy":
        return <Badge variant="destructive">Desconectado</Badge>
      case "checking":
        return <Badge variant="secondary">Verificando...</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        {getStatusBadge()}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          Estado de la Base de Datos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estado:</span>
          {getStatusBadge()}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Keep-Alive:</span>
          <Badge variant={status.isActive ? "default" : "secondary"}>{status.isActive ? "Activo" : "Inactivo"}</Badge>
        </div>

        {status.lastPing && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Último ping:</span>
            <span className="text-xs text-muted-foreground">{new Date(status.lastPing).toLocaleTimeString()}</span>
          </div>
        )}

        <Button
          onClick={handleManualPing}
          disabled={isManualPinging}
          size="sm"
          variant="outline"
          className="w-full bg-transparent"
        >
          {isManualPinging ? (
            <>
              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Activity className="w-3 h-3 mr-2" />
              Verificar Conexión
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
