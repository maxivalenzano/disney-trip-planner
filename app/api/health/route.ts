import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Verificar conexión a Supabase
    const { data, error } = await supabase.from("trips").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "disconnected",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
