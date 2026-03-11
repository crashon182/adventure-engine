import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = (await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    })) as any;

    // Rutas que siempre deben estar disponibles (Auth, Next, Assets)
    if (
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/uploads') ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/mantenimiento' ||
        pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
    ) {
        return NextResponse.next();
    }

    // Proteger el Panel de Administración (Solo ADMIN)
    if (pathname.startsWith('/admin')) {
        if (!token || token.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Proteger el Editor (Requiere estar logueado)
    if (pathname.startsWith('/editor')) {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Chequeo de Mantenimiento
    let isMaintenance = process.env.MAINTENANCE_MODE === 'true';

    try {
        const baseUrl = request.nextUrl.origin;
        // Solo intentar el fetch si no está ya activo por env para ahorrar una petición
        if (!isMaintenance) {
            const res = await fetch(`${baseUrl}/api/settings/status`, {
                cache: 'no-store',
                next: { revalidate: 0 },
                signal: AbortSignal.timeout(2000) // Timeout para evitar bloqueos
            });

            if (res.ok) {
                const data = await res.json();
                isMaintenance = !!data.maintenanceMode;
            }
        }
    } catch (e) {
        console.error('Middleware maintenance check failed, using env fallback:', e);
    }

    // Redirigir a mantenimiento si:
    // 1. El modo está activo (por DB o por ENV)
    // 2. El usuario NO es ADMIN (los admins pueden ver el sitio siempre)
    if (isMaintenance && token?.role !== 'ADMIN') {
        const { pathname } = request.nextUrl;
        // Evitar bucle de redirección si ya estamos en /mantenimiento
        if (pathname !== '/mantenimiento') {
            return NextResponse.redirect(new URL('/mantenimiento', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
