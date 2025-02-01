import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export const authOptions: NextAuthOptions = {
  providers: [
    // Temporarily comment out Spotify provider
    /* SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "user-read-email user-read-currently-playing user-top-read user-read-recently-played"
        }
      }
    }), */
  ],
  // Temporary basic configuration
  secret: process.env.NEXTAUTH_SECRET,
};