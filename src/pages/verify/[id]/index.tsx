import {z} from "zod";
import { type NextPage } from "next";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "@/server/auth";
import { useRouter } from 'next/router'
import { api } from "@/utils/api";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const Page: NextPage = () => {
    const router = useRouter();
    const uniqueString = router.query.id;
    return <div> 
        {uniqueString} 
        </div>
}


export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const uniqueString = await ctx.query.id
    const bool = await prisma.emailVerification.delete({
        where: {
            identifier: uniqueString,
        },
    })
    return {
        props: { },
    };
};

// Page.getInitialProps = async (ctx) => {
//     const emailVerify = api.emailVerify.delete.useMutation();
//     emailVerify.mutate({
//         identifier: uniqueString
//     })
//     // const session = await getServerAuthSession(ctx);
//     // if (session) {
//     //     return {
//     //         redirect: {
//     //             destination: "/verify",
//     //             permanent: false,
//     //         },
//     //     };
//     // }
//     // return {
//     //     props: { session },
//     // };
// };

export default Page;