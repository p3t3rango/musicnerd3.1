import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

// Add proper typing for the session and token
interface ExtendedToken {
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  accessTokenExpires?: number;
}

interface ExtendedSession {
  accessToken?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "user-read-email user-read-currently-playing user-top-read user-read-recently-played"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // Type assertion to match our extended interfaces
      (session as ExtendedSession).accessToken = (token as ExtendedToken).accessToken;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 