import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { v4 as uuidv4 } from "uuid";
import sendGrid from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  throw new Error("SENDGRID_API_KEY environment variable is not set");
}
sendGrid.setApiKey(apiKey);


export const emailVerifyRouter = createTRPCRouter({
    create: publicProcedure
        .input(z.object({ name:z.string().nonempty(), email: z.string().email() }))
        .mutation(async ({ctx, input})=> {
            const uniqueString = uuidv4() + input.name;
            const uniqueLink = `${process.env.NEXTAUTH_URL}/verify/${uniqueString}`;
            await ctx.prisma.emailVerification.create({
                data: {
                    name : input.name,
                    identifier : uniqueString
                }
            })
            const msg = {
                    to: input.email, // Change to your recipient
                    from: 'lfg.travelplanner@gmail.com', // Change to your verified sender
                    subject: 'Sending with SendGrid is Fun',
                    text: 'and easy to do anywhere, even with Node.js',
                    html: `<p>Verify your email address to complete the signup and login to your account.</p>
                            <p>This link expires in 6 hours.</p>
                            <p>Click <a href="${uniqueLink}">here</a> to verify.</p>`,
            };
            await sendGrid.send(msg).then(() => {
                        console.log('Email sent')
                    })
                    .catch((error: any) => {
                        console.error(error)
                    })
            }),
    delete: publicProcedure.input(z.object({ identifier: z.string() }))
        .mutation(async ({ ctx, input }) => {
                await ctx.prisma.emailVerification.delete({
                    where: {
                        identifier: input.identifier,
                    },
                });
        }),

    updateEmailVerified: publicProcedure.input(z.object({name:z.string()}))
        .mutation(async({ctx, input}) => {
            await ctx.prisma.user.update({
                where: {
                    name: input.name
                },
                data: {
                    emailVerified: true
                },
            })
        })
})