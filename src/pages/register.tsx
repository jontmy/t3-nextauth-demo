import React from "react";
import { api } from "@/utils/api";

export default function Page() {
    const register = api.users.create.useMutation();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        register.mutate({
            username: e.target.username.value,
            email: e.target.email.value,
            password: e.target.password.value
        });
    }

    return <form className="flex flex-col p-8 space-y-2" onSubmit={handleSubmit}>
        <label className="flex space-x-2 ">
            <p>Username</p>
            <input type="text" name="username" />
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
    </form>;
}