import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('[Auth] Missing credentials');
            throw new Error("Email and password are required");
          }

          console.log('[Auth] Attempting login for:', credentials.email);

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

          if (!user) {
            console.error('[Auth] User not found:', credentials.email);
            throw new Error("Invalid email or password");
          }

          if (!user.hashedPassword) {
            console.error('[Auth] User has no password set:', credentials.email);
            throw new Error("Invalid email or password");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);

          if (!isPasswordValid) {
            console.error('[Auth] Invalid password for:', credentials.email);
            throw new Error("Invalid email or password");
          }

          console.log('[Auth] Login successful for:', credentials.email, 'Role:', user.role);

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('[Auth] Authorization error:', error);
          throw error;
        }
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
    },
    async redirect({ url, baseUrl }) {
      // Handle callback URL after sign-in
      if (url.startsWith(baseUrl) && url.includes('/api/auth/callback')) {
        // Get the callback URL from the search parameters, if any
        const callbackUrl = new URL(url).searchParams.get('callbackUrl');
        
        // If there's a callback URL, use it
        if (callbackUrl) {
          return callbackUrl.startsWith(baseUrl) ? callbackUrl : baseUrl;
        }
        
        return baseUrl;
      }
      
      // For all other cases, just return the URL
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  }
});

export { handler as GET, handler as POST };
