import {z} from "zod";
import { type NextPage } from "next";
import { type GetServerSideProps } from "next";
import { useRouter } from 'next/router'
import { PrismaClient } from "@prisma/client";
import Link from "next/link"

const prisma = new PrismaClient();

const Page: NextPage = () => {
    const router = useRouter();
    const uniqueString = router.query.id;
    return <div> 
        You have succesfully verified your email! 
        <p>Click </p> 
        <Link href = "/">
            here
        </Link>
        <p> to login</p>
    </div>
}


export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const uniqueString = ctx.query.id

    const info = await prisma.emailVerification.findFirst({
        where: {
            identifier: uniqueString
        }
    })

    try {
        await prisma.user.update({
                    where: {
                        name: info.name
                    },
                    data: {
                        emailVerified: true
                    },
        })
    } catch (e) {
       console.log(e)
    } 

    if (info) {
        await prisma.emailVerification.delete({
        where: {    
            identifier: uniqueString,
        }
        })
    }
    

    return {
        props: {  },
    };
};

export default Page;