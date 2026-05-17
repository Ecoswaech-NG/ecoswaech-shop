import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { ensureSwaechId } from "@/lib/swaech/createSwaechId"; // Added

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt", maxAge: 60 },

  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;

      try {
        let dbUser = await prisma.user.findFirst({
          where: {
            provider: account.provider,
            providerId: account.providerAccountId,
          },
        });

        if (!dbUser) {
          dbUser = await prisma.user.findUnique({ where: { email: user.email } });

          if (dbUser) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                provider: account.provider,
                providerId: account.providerAccountId,
                emailVerified: true,
                photoURL: user.image ?? dbUser.photoURL,
              },
            });
          } else {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                fullName: user.name ?? "",
                photoURL: user.image ?? null,
                provider: account.provider,
                providerId: account.providerAccountId,
                emailVerified: true,
              },
            });
          }
        }

        // ─── SWAECH ID HOOK ──────────────────────────────────────────────────
        await ensureSwaechId(dbUser.id).catch(console.error);

        const token = await signToken({ userId: dbUser.id, email: dbUser.email });
        const cookieStore = await cookies();
        cookieStore.set("swaech-token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });

        return true;
      } catch (err) {
        console.error("OAuth signIn error:", err);
        return false;
      }
    },
  },
  pages: { signIn: "/login", error: "/login" },
});

export { handler as GET, handler as POST };