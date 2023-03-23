import { z } from "zod";
import argon2 from "argon2"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";



export const usersRouter = createTRPCRouter({
    create: publicProcedure
        .input(z.object({ name: z.string().nonempty(), email: z.string().email(), password: z.string().min(8) }))
        .mutation(async ({ ctx, input }) => {
            
            await ctx.prisma.user.create({
                data: {
                    ...input,
                    password: await argon2.hash(input.password)
                }
            });
        }),

    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.example.findMany();
    }),

    getSecretMessage: protectedProcedure.query(() => {
        return "you can now see this secret message!";
    })
});
