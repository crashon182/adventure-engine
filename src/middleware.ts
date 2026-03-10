import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Comprobamos si el modo mantenimiento está activo
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

    // Permitimos acceder a la ruta de mantenimiento directamente para no entrar en bucle infinito
    if (request.nextUrl.pathname === '/mantenimiento') {
        if (!isMaintenanceMode) {
            // Si el sitio NO está en mantenimiento y tratan de entrar a /mantenimiento, los devolvemos al inicio
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Permitimos rutas esenciales (API públicas que sirvas, imágenes, admin, etc.)
    // OJO: ajusta las rutas que quieras que siempre estén disponibles
    if (
        request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/uploads') ||
        request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
    ) {
        return NextResponse.next();
    }

    // Si estamos en mantenimiento y la ruta no es permitida, redirigimos a /mantenimiento
    if (isMaintenanceMode) {
        return NextResponse.redirect(new URL('/mantenimiento', request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Configura aquí para qué rutas se ejecuta este middleware
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
