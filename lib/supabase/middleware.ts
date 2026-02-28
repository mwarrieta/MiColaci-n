import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ['/', '/login', '/registro', '/auth']

// Rutas protegidas por rol
const ROLE_ROUTES: Record<string, string[]> = {
    admin: ['/admin'],
    repartidor: ['/delivery'],
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANTE: No ejecutar código entre createServerClient y getUser()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Verificar si la ruta es pública
    const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
    )

    // Si no hay usuario y la ruta no es pública → redirigir a login
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
    }

    // Si hay usuario, verificar acceso por rol a rutas protegidas
    if (user) {
        // Obtener el rol del usuario desde profiles
        const { data: profile } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', user.id)
            .single()

        const userRole = profile?.rol || 'cliente'

        // Verificar si la ruta requiere un rol específico
        for (const [requiredRole, routes] of Object.entries(ROLE_ROUTES)) {
            const isProtectedRoute = routes.some(
                (route) => pathname === route || pathname.startsWith(route + '/')
            )

            if (isProtectedRoute && userRole !== requiredRole && userRole !== 'admin') {
                // Admin puede acceder a todo, otros roles solo a sus rutas
                const url = request.nextUrl.clone()
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }

        // Si el usuario ya está logueado e intenta ir a /login, redirigir según rol
        if (pathname === '/login' || pathname === '/registro') {
            const url = request.nextUrl.clone()
            if (userRole === 'admin') {
                url.pathname = '/admin'
            } else if (userRole === 'repartidor') {
                url.pathname = '/delivery'
            } else {
                url.pathname = '/'
            }
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
