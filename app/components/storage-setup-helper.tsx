"use client"

import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function StorageSetupHelper() {
  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error" | "warning">("idle")
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const checkStorageSetup = async () => {
    try {
      setChecking(true)
      setStatus("idle")

      // Intentar una operación simple en el bucket
      const { error: testError } = await supabase.storage.from("movie-photos").list("", { limit: 1 })

      if (!testError) {
        setStatus("success")
        setMessage("¡Almacenamiento configurado correctamente! El bucket 'movie-photos' está funcionando.")

        toast({
          title: "✅ Configuración exitosa",
          description: "El almacenamiento de fotos está listo para usar",
        })
      } else {
        setStatus("warning")
        setMessage(
          `Bucket detectado pero con advertencias: ${testError.message}. Puedes intentar subir fotos de todas formas.`,
        )

        toast({
          title: "⚠️ Configuración parcial",
          description: "El bucket existe pero puede necesitar ajustes de permisos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Storage setup error:", error)
      setStatus("error")

      if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage("Error desconocido al verificar el almacenamiento")
      }

      toast({
        title: "❌ Error de verificación",
        description: "Revisa las instrucciones para configurar manualmente",
        variant: "destructive",
      })
    } finally {
      setChecking(false)
    }
  }

  // Resto del componente permanece igual...
  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">📸 Configuración de Almacenamiento de Fotos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Para subir fotos, necesitas configurar el almacenamiento en Supabase Storage.
        </p>

        <div className="flex gap-2">
          <Button onClick={checkStorageSetup} disabled={checking} className="bg-purple-600 hover:bg-purple-700">
            {checking ? "Verificando..." : "🔧 Verificar Configuración"}
          </Button>

          <Button variant="outline" asChild>
            <a
              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/project/default/storage/buckets`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Abrir Supabase Storage
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>

        {status !== "idle" && (
          <Alert className={getStatusColor()}>
            <div className="flex items-start gap-2">
              {getStatusIcon()}
              <AlertDescription className="flex-1">{message}</AlertDescription>
            </div>
          </Alert>
        )}

        {(status === "error" || status === "warning") && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 Configuración Manual Requerida:</h4>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>
                Ve a <strong>Storage</strong> en tu dashboard de Supabase
              </li>
              <li>
                Selecciona el bucket <code className="bg-blue-100 px-1 rounded">movie-photos</code>
              </li>
              <li>
                Ve a la pestaña <strong>"Policies"</strong>
              </li>
              <li>
                Crea una nueva política con estos valores:
                <ul className="ml-4 mt-1 space-y-1">
                  <li>
                    • <strong>Policy name:</strong> "Public Access"
                  </li>
                  <li>
                    • <strong>Allowed operation:</strong> ALL
                  </li>
                  <li>
                    • <strong>Target roles:</strong> public
                  </li>
                  <li>
                    • <strong>USING expression:</strong> <code className="bg-blue-100 px-1 rounded">true</code>
                  </li>
                  <li>
                    • <strong>WITH CHECK expression:</strong> <code className="bg-blue-100 px-1 rounded">true</code>
                  </li>
                </ul>
              </li>
              <li>
                Asegúrate de que el bucket esté marcado como <strong>"Public"</strong>
              </li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
