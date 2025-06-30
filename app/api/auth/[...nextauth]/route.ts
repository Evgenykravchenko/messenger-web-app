import bcrypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import type { User as PrismaUser } from "@prisma/client";

import prisma from "@/app/libs/prismaDB";

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string
        }),
        CredentialsProvider<
            { email: { label: string; type: string }; password: { label: string; type: string } },
            PrismaUser
        >({
            name: "credentials",
            credentials: {
                email:    { label: "Email",    type: "text"     },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<PrismaUser | null> {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid Credentials");
                }

                const user = (await prisma.user.findUnique({
                    where: { email: credentials.email },
                })) as PrismaUser | null;

                if (!user || !user.hashedPassword) {
                    throw new Error("Invalid Credentials");
                }

                const isCorrect = await bcrypt.compare(
                    credentials.password,
                    user.hashedPassword
                );

                if (!isCorrect) {
                    throw new Error("Invalid Credentials");
                }

                return user;
            },
        })
    ],
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };