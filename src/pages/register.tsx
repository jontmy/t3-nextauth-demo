import React from "react";
import { api } from "@/utils/api";
import Link from "next/link"
import {useState} from "react"


export default function Page() {
    const register = api.users.create.useMutation();
    const emailVerify = api.emailVerify.create.useMutation();
    const [message, setMessage]  = useState(true)
    

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const res = emailVerify.mutate({
            name: e.target.name.value,
            email:e.target.email.value,
        })

        console.log(res)

         
        register.mutate({
                // type errors can be ignored here, ts can't see the name props
                name: e.target.name.value,
                email: e.target.email.value,
                password: e.target.password.value
            });
        setMessage(false)
        
    }

    return <form className="flex flex-col p-8 space-y-2" onSubmit={handleSubmit}>
        <label className="flex space-x-2 ">
            <p>Username</p>
            <input type="text" name="name" />
        </label>
        <label className="flex space-x-2 ">
            <p>Email</p>
            <input type="text" name="email" />
        </label>
        <label className="flex space-x-2 ">
            <p>Password</p>
            <input type="password" name="password" />
        </label>
        <button type="submit">
            Submit
        </button>
        <p>{message ? "Please Register" : "Please check your email for Verification"}</p>
    </form>;
}