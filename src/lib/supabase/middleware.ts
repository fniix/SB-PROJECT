import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ── Protected routes: redirect to login if not authenticated ──
  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ── If user is logged in and tries to access login/register, redirect to dashboard ──
  if (user && (pathname === '/login' || pathname === '/register')) {
    let role = user.user_metadata?.role || 'parent'
    if (role !== 'parent' && role !== 'beneficiary' && role !== 'specialist' && role !== 'admin') {
      role = 'parent'
    }
    const targetPath = `/dashboard/${role}`
    const url = request.nextUrl.clone()
    url.pathname = targetPath
    return NextResponse.redirect(url)
  }

  // ── Role-based dashboard access control ──
  if (user && pathname.startsWith('/dashboard/')) {
    let userRole = user.user_metadata?.role || 'parent'
    if (userRole !== 'parent' && userRole !== 'beneficiary' && userRole !== 'specialist' && userRole !== 'admin') {
      userRole = 'parent'
    }

    // Admin-only routes
    if (pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${userRole}`
      return NextResponse.redirect(url)
    }

    // Specialist routes
    if (pathname.startsWith('/dashboard/specialist') && userRole !== 'specialist' && userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${userRole}`
      return NextResponse.redirect(url)
    }

    // Beneficiary routes
    if (pathname.startsWith('/dashboard/beneficiary') && userRole !== 'beneficiary' && userRole !== 'admin' && userRole !== 'parent') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${userRole}`
      return NextResponse.redirect(url)
    }

    // Parent routes — accessible by parents only
    if (pathname.startsWith('/dashboard/parent') && userRole !== 'parent') {
      // Allow admin to access parent dashboard for support
      if (userRole !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = `/dashboard/${userRole}`
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
