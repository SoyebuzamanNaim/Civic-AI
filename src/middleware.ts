import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect all /government/* routes except /government/login
  if (
    request.nextUrl.pathname.startsWith('/government') &&
    !request.nextUrl.pathname.startsWith('/government/login')
  ) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/government/login';
      const redirectRes = NextResponse.redirect(url);
      if (request.headers.has('next-action')) {
        redirectRes.headers.set('x-action-redirect', '/government/login');
      }
      return redirectRes;
    }
  }

  // Redirect logged in users away from /government/login to /government/dashboard
  if (request.nextUrl.pathname.startsWith('/government/login') && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/government/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/government/:path*'],
};
