import type { NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    sessionToken?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
    }
    sessionToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    sessionToken?: string;
  }
}

// Generate a unique session token
function generateSessionToken(): string {
  return crypto.randomUUID();
}

// Check if this is the active session for the user
export async function isActiveSession(userId: string, sessionToken: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeSessionToken: true }
  });
  return user?.activeSessionToken === sessionToken;
}

// Set the active session for a user (invalidates other sessions)
export async function setActiveSession(userId: string, sessionToken: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { activeSessionToken: sessionToken }
  });
}

// Clear the active session (logout)
export async function clearActiveSession(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { activeSessionToken: null }
  });
}

/** Resolve DB user from a NextAuth session (id first — phone-only users have no email). */
export async function getUserFromSession(session: Session | null) {
  if (!session?.user) return null;

  if (session.user.id) {
    const byId = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (byId) return byId;
  }

  if (session.user.email) {
    return prisma.user.findUnique({ where: { email: session.user.email } });
  }

  return null;
}

export const authOptions: NextAuthOptions = {
  // Required for JWT sessions in production (Vercel, etc.); without it cookies/session break.
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
        switchSession: { label: "Switch Session", type: "hidden" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const identifier = credentials.email.trim();

        const selectFields = {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          hashedPassword: true,
          activeSessionToken: true,
        };

        // Try email lookup first, then phone
        let user = await prisma.user.findUnique({
          where: { email: identifier },
          select: selectFields,
        });

        if (!user) {
          user = await prisma.user.findUnique({
            where: { phone: identifier },
            select: selectFields,
          });
        }

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isPasswordValid) {
          return null;
        }

        // Generate new session token
        const newSessionToken = generateSessionToken();

        // Check if user has an active session elsewhere
        if (user.activeSessionToken && !credentials.switchSession) {
          // Throw error to indicate existing session - will be caught and trigger modal
          throw new Error('ExistingSession');
        }

        // Set this as the active session (invalidates others)
        await setActiveSession(user.id, newSessionToken);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sessionToken: newSessionToken,
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
        token.sessionToken = (user as any).sessionToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session as any).sessionToken = token.sessionToken;

        // Validate that this is still the active session
        if (token.id && token.sessionToken) {
          const isActive = await isActiveSession(token.id as string, token.sessionToken as string);
          if (!isActive) {
            // Session has been invalidated (logged in elsewhere)
            (session as any).isInvalidated = true;
          }
        }
      }
      return session;
    }
  },
  events: {
    async signOut({ token }) {
      // Clear active session on logout
      if (token?.id) {
        await clearActiveSession(token.id as string);
      }
    }
  }
};
