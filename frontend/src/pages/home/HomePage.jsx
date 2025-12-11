import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { AuthContext } from "../../contexts/AuthContext"
import SideBar from "./components/SideBar"
import Settings from "./components/Settings"
import Friends from "./components/Friends"
import Conversation from "./components/Conversation"

export default function HomePage() {
    const { user, ready } = useContext(AuthContext)
    const navigate = useNavigate()
    const [currentSection, setCurrentSection] = useState('friends')
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        if (ready && !user) {
            navigate("/signup")
        }
    }, [user, ready, navigate])

    const handleSectionChange = (section) => {
        setCurrentSection(section)
    }

    return (
        <main className="bg-zinc-800 text-white h-screen flex overflow-hidden">
            <SideBar user={user} ready={ready} onSectionChange={handleSectionChange} currentUser={currentUser} setCurrentUser={setCurrentUser} />

            <section className="flex-1 flex flex-col overflow-hidden">
                {currentSection.name === 'friends' && (
                    <Friends user={user} />
                )}

                {currentSection.name === "users" && (
                    <Conversation user={user} partnerId={currentSection.id} />
                )}

                {currentSection.name === "settings" && (
                    <Settings user={user} currentUser={currentUser} />
                )}
            </section>
        </main>
    )
}
