import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
const { v4: uuidv4 } = require("uuid");
const sendGrid = require('@sendgrid/mail')
sendGrid.setApiKey(process.env.SENDGRID_API_KEY)


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
            async function register() {
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
                        console.log()
                    })
                    .catch((error: any) => {
                        console.error(error)
                    })
            }

            register()
        }),
    // getVerifyPageInfo: publicProcedure
    //     .input(z.object({id :z.string()}))
    //     .query(({ctx, input}) => {
    //         ctx.prisma.example.findMany(

    //         )
    //     }),
    delete: publicProcedure.input(z.object({ identifier: z.string() }))
        .mutation(async ({ ctx, input }) => {
                await ctx.prisma.emailVerification.delete({
                    where: {
                        identifier: input.identifier,
                    },
                });
        }),
})