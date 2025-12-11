import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"

export default function useLogout() {
    const { dispatch } = useContext(AuthContext)

    const logout = () => {
        localStorage.removeItem("token")
        dispatch({ type: "LOGOUT" })
    }

    return { logout }
}
