import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rutas que siempre deben estar disponibles (Assets, API, Editor)
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/uploads') ||
        pathname.startsWith('/editor') || // Permitimos el editor siempre para poder desactivar el modo
        pathname === '/mantenimiento' ||
        pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
    ) {
        return NextResponse.next();
    }

    try {
        // Consultamos la API de estatus (usamos el origen de la request)
        // Agregamos un header para evitar recursividad si fuera necesario
        const baseUrl = request.nextUrl.origin;
        const res = await fetch(`${baseUrl}/api/settings/status`, {
            cache: 'no-store'
        });
        const data = await res.json();

        if (data.maintenanceMode) {
            return NextResponse.redirect(new URL('/mantenimiento', request.url));
        }
    } catch (e) {
        console.error('Middleware maintenance check failed', e);
    }

    return NextResponse.next();
}

export const config = {
    // Configura aquí para qué rutas se ejecuta este middleware
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
