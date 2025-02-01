import { AuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

export const authOptions: AuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
      authorization: {
        url: 'https://accounts.spotify.com/authorize',
        params: {
          scope: [
            'user-read-email',
            'user-read-currently-playing',
            'user-read-playback-state',
            'user-read-recently-played',
            'user-top-read'
          ].join(' ')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development',
}; 