import { useState } from "react"
import useLogin from "./useLogin"

export default function useSignup() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const { login } = useLogin()

    const signup = async (username, password) => {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        })

        const data = await res.json()

        setIsLoading(false)
        if (!res.ok) {
            setError(data.error.message)
            return
        } else {
            await login(username, password)
        }
    }

    return { signup, isLoading, error }
}
