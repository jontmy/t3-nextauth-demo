import { type GetServerSidePropsContext } from "next";
import { type DefaultSession, getServerSession, type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/server/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import argon2 from "argon2";
import { randomBytes, randomUUID } from "crypto";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            // ...other properties
            // role: UserRole;
        } & DefaultSession["user"];
    }

    // interface User {
    //   // ...other properties
    //   // role: UserRole;
    // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
        callbacks: {
            jwt: ({ token, user }) => {
                console.log("JWT()");
                if (user) {
                    token.id = user.id;
                    token.email = user.email;
                    token.username = user.username;
                }
                console.table(token);
                console.table(user);
                return token;
            },
            session({ session, token }) {
                console.log("SESSION()");
                if (token) {
                    session.user.name = token.username;
                }
                console.table(session);
                console.table(token);
                return session;
            }
        },
        session: {
            // Choose how you want to save the user session.
            // The default is `"jwt"`, an encrypted JWT (JWE) stored in the session cookie.
            // If you use an `adapter` however, we default it to `"database"` instead.
            // You can still force a JWT session by explicitly defining `"jwt"`.
            // When using `"database"`, the session cookie will only contain a `sessionToken` value,
            // which is used to look up the session in the database.
            strategy: "jwt",
            // Seconds - How long until an idle session expires and is no longer valid.
            maxAge: 30 * 24 * 60 * 60, // 30 days
            // Seconds - Throttle how frequently to write to database to extend a session.
            // Use it to limit write operations. Set to 0 to always update the database.
            // Note: This option is ignored if using JSON Web Tokens
            updateAge: 24 * 60 * 60, // 24 hours
            // The session token is usually either a random UUID or string, however if you
            // need a more customized session token string, you can define your own generate function.
            generateSessionToken: () => {
                return randomUUID?.() ?? randomBytes(32).toString("hex");
            }
        },
        adapter: PrismaAdapter(prisma),
        providers: [
            /**
             * ...add more providers here.
             *
             * Most other providers require a bit more work than the Discord provider. For example, the
             * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
             * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
             *
             * @see https://next-auth.js.org/providers/github
             */
            CredentialsProvider({
                // The name to display on the sign in form (e.g. 'Sign in with...')
                name: "Credentials",
                // The credentials is used to generate a suitable form on the sign in page.
                // You can specify whatever fields you are expecting to be submitted.
                // e.g. domain, username, password, 2FA token, etc.
                // You can pass any HTML attribute to the <input> tag through the object.
                credentials: {
                    username: { label: "Username", type: "text", placeholder: "johndoe" },
                    password: { label: "Password", type: "password" }
                },
                async authorize(credentials, _) {
                    // You need to provide your own logic here that takes the credentials
                    // submitted and returns either a object representing a user or value
                    // that is false/null if the credentials are invalid.
                    // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
                    // You can also use the `req` object to obtain additional parameters
                    // (i.e., the request IP address)
                    if (!credentials) {
                        return null;
                    }
                    const schema = z.object({
                        username: z.string().nonempty(),
                        password: z.string().nonempty()
                    });
                    const result = schema.safeParse(credentials);
                    if (!result.success) {
                        return null;
                    }
                    const { username, password } = result.data;
                    const user = await prisma.user.findUnique({
                        where: {
                            username
                        }
                    });
                    if (!user || user.password === null) {
                        return null;
                    }
                    const isPasswordValid = await argon2.verify(user.password, password);
                    if (!isPasswordValid) {
                        return null;
                    }
                    return user;
                }
            })
        ]
    }
;

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
    req: GetServerSidePropsContext["req"];
    res: GetServerSidePropsContext["res"];
}) => {
    return getServerSession(ctx.req, ctx.res, authOptions);
};
