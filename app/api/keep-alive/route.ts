import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Realizar una consulta simple para mantener la base de datos activa
        const { data, error } = await supabase.from('trips').select('id').limit(1);

        if (error) {
            console.error('Keep-alive query failed:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        console.log('Keep-alive query successful at:', new Date().toISOString());

        return NextResponse.json({
            success: true,
            message: 'Database keep-alive successful',
            timestamp: new Date().toISOString(),
            recordsFound: data?.length || 0,
        });
    } catch (error) {
        console.error('Keep-alive error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// También permitir POST para mayor flexibilidad
export async function POST() {
    return GET();
}
