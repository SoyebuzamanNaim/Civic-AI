import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

describe('Phase 5 Government Auth Middleware & Security Tests', () => {
  it('should redirect unauthenticated requests from /government/dashboard to /government/login', async () => {
    const request = new NextRequest('http://localhost:3000/government/dashboard', {
      method: 'GET',
    });

    const res = await middleware(request);
    expect(res.status).toBe(307); // Temporary redirect in Next.js response
    expect(res.headers.get('location')).toContain('/government/login');
  });

  it('should allow access to public routes /report/new without redirection', async () => {
    const request = new NextRequest('http://localhost:3000/report/new', {
      method: 'GET',
    });

    const res = await middleware(request);
    expect(res.status).toBe(200);
  });
});
