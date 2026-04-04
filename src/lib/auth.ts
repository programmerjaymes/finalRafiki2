import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
    }
  }
}

export const authOptions: NextAuthOptions = {
  // Required for JWT sessions in production (Vercel, etc.); without it cookies/session break.
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            hashedPassword: true,
          },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    // Session expires after 2 hours of inactivity
    maxAge: 60 * 60 * 2,
    // Refresh the session token every 15 minutes (when active)
    updateAge: 60 * 15,
  },
  jwt: {
    // Keep JWT lifetime aligned with session lifetime
    maxAge: 60 * 60 * 2,
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl) && url.includes('/api/auth/callback')) {
        const callbackUrl = new URL(url).searchParams.get('callbackUrl');
        if (callbackUrl) {
          try {
            const target = new URL(callbackUrl, baseUrl);
            if (target.origin === new URL(baseUrl).origin) {
              return `${target.pathname}${target.search}${target.hash}`;
            }
          } catch {
            /* ignore invalid callback */
          }
        }
        return baseUrl;
      }
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
};
