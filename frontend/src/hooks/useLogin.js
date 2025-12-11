import { useState, useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"

export default function useLogin() {
    const { dispatch } = useContext(AuthContext)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const login = async (username, password) => {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password })
        })

        const data = await res.json()

        if (!res.ok) {
            setIsLoading(false)
            setError(data.error.message)
            return
        }

        if (res.ok) {
            localStorage.setItem("token", data.token)
            dispatch({ type: "LOGIN", user: data.token })
            setIsLoading(false)
        }
    }

    return { login, isLoading, error }
}
