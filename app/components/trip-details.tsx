"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plane, Hotel, Calendar, MapPin, Edit, Save, X } from "lucide-react"
import { getTrip, upsertTrip } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function TripDetails() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [tripData, setTripData] = useState({
    start_date: "",
    end_date: "",
    flight_info: "",
    hotel_name: "",
    hotel_reservation: "",
    notes: "",
  })

  useEffect(() => {
    loadTripData()
  }, [])

  const loadTripData = async () => {
    try {
      setLoading(true)
      const trip = await getTrip()
      if (trip) {
        setTripData({
          start_date: trip.start_date || "",
          end_date: trip.end_date || "",
          flight_info: trip.flight_info || "",
          hotel_name: trip.hotel_name || "",
          hotel_reservation: trip.hotel_reservation || "",
          notes: trip.notes || "",
        })
      }
    } catch (error) {
      console.error("Error loading trip data:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del viaje",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await upsertTrip(tripData)
      setIsEditing(false)
      toast({
        title: "¡Guardado!",
        description: "La información del viaje se ha guardado correctamente",
      })
    } catch (error) {
      console.error("Error saving trip data:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la información del viaje",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-purple-700">Detalles del Viaje</h2>
        <Button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={saving}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          {saving ? (
            "Guardando..."
          ) : isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </>
          )}
        </Button>
      </div>

      {/* Fechas del Viaje */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Calendar className="w-5 h-5" />
            Fechas del Viaje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              {isEditing ? (
                <Input
                  id="startDate"
                  type="date"
                  value={tripData.start_date}
                  onChange={(e) => setTripData({ ...tripData, start_date: e.target.value })}
                />
              ) : (
                <div className="p-2 bg-white rounded border">
                  {tripData.start_date ? (
                    new Date(tripData.start_date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  ) : (
                    <span className="text-gray-500">No definida</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="endDate">Fecha de Fin</Label>
              {isEditing ? (
                <Input
                  id="endDate"
                  type="date"
                  value={tripData.end_date}
                  onChange={(e) => setTripData({ ...tripData, end_date: e.target.value })}
                />
              ) : (
                <div className="p-2 bg-white rounded border">
                  {tripData.end_date ? (
                    new Date(tripData.end_date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  ) : (
                    <span className="text-gray-500">No definida</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de Vuelo */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Plane className="w-5 h-5" />
            Información de Vuelo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="flightInfo">Detalles del Vuelo</Label>
          {isEditing ? (
            <Input
              id="flightInfo"
              value={tripData.flight_info}
              onChange={(e) => setTripData({ ...tripData, flight_info: e.target.value })}
              placeholder="Número de vuelo, hora, aeropuerto..."
            />
          ) : (
            <div className="p-3 bg-white rounded border">
              <p className="font-medium">{tripData.flight_info || "No definido"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del Hotel */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Hotel className="w-5 h-5" />
            Hotel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hotelName">Nombre del Hotel</Label>
            {isEditing ? (
              <Input
                id="hotelName"
                value={tripData.hotel_name}
                onChange={(e) => setTripData({ ...tripData, hotel_name: e.target.value })}
                placeholder="Nombre del hotel"
              />
            ) : (
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-orange-800">{tripData.hotel_name || "No definido"}</p>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="hotelReservation">Número de Reserva</Label>
            {isEditing ? (
              <Input
                id="hotelReservation"
                value={tripData.hotel_reservation}
                onChange={(e) => setTripData({ ...tripData, hotel_reservation: e.target.value })}
                placeholder="Número de confirmación"
              />
            ) : (
              <div className="p-3 bg-white rounded border">
                <p className="font-mono text-sm">{tripData.hotel_reservation || "No definido"}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <MapPin className="w-5 h-5" />
            Notas y Observaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="notes">Notas del Viaje</Label>
          {isEditing ? (
            <Textarea
              id="notes"
              value={tripData.notes}
              onChange={(e) => setTripData({ ...tripData, notes: e.target.value })}
              placeholder="Añade cualquier información importante sobre tu viaje..."
              rows={4}
            />
          ) : (
            <div className="p-3 bg-white rounded border">
              <p className="text-gray-700 whitespace-pre-wrap">{tripData.notes || "Sin notas"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-green-500 hover:bg-green-600">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
          <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}
