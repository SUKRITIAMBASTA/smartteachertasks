import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).select('+password');
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          assignedSubjects: user.assignedSubjects || [],
          departmentId: user.departmentId ? user.departmentId.toString() : null,
          semester: user.semester || 1,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = user.email;
        if (!email) return false;
        
        await dbConnect();
        let dbUser = await User.findOne({ email });
        
        // If user doesn't exist, auto-register them as a student
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name || 'Google User',
            email: email,
            role: 'student',
            password: await bcrypt.hash(Math.random().toString(36), 10),
            institution: 'ASET'
          });
        }
        
        user.id = dbUser._id.toString();
        (user as any).role = dbUser.role;
        (user as any).assignedSubjects = dbUser.assignedSubjects || [];
        (user as any).departmentId = dbUser.departmentId ? dbUser.departmentId.toString() : null;
        (user as any).semester = dbUser.semester || 1;
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
        token.assignedSubjects = (user as any).assignedSubjects;
        token.departmentId = (user as any).departmentId;
        token.semester = (user as any).semester;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).assignedSubjects = token.assignedSubjects;
        (session.user as any).departmentId = token.departmentId;
        (session.user as any).semester = token.semester;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
