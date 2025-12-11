import { useState, useEffect, useRef } from "react";
import { Send, UserPlus, Ban, Unlock } from "lucide-react";

export default function Conversation({ user, partnerId }) {
    const [messages, setMessages] = useState([]);
    const [partner, setPartner] = useState(null);
    const [isFriend, setIsFriend] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const prevScrollHeightRef = useRef(0);

    useEffect(() => {
        if (!user || !partnerId) return;

        setMessages([]);
        setSkip(0);
        setHasMore(true);
        async function fetchData() {
            setIsLoading(true);
            try {
                const [userRes, msgRes, friendRes, blockedRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${partnerId}`, {
                        headers: { "Authorization": `Bearer ${user}` }
                    }),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages/${partnerId}`, {
                        headers: { "Authorization": `Bearer ${user}` }
                    }),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/friends`, {
                        headers: { "Authorization": `Bearer ${user}` }
                    }),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/friends/blocked`, {
                        headers: { "Authorization": `Bearer ${user}` }
                    })
                ]);

                if (userRes.ok) {
                    const data = await userRes.json();
                    setPartner(data.user);
                }

                if (msgRes.ok) {
                    const data = await msgRes.json();
                    const msgs = data.messages || []
                    setMessages(msgs)
                    setHasMore(msgs.length >= 50);
                    setSkip(msgs.length);

                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView();
                    }, 100);
                }

                if (friendRes.ok) {
                    const data = await friendRes.json();
                    const friends = data.friends || [];
                    setIsFriend(friends.some(f => f.id === parseInt(partnerId)));
                }

                if (blockedRes.ok) {
                    const data = await blockedRes.json();
                    const blocked = data.blockedUsers || [];
                    setIsBlocked(blocked.some(u => u.id === parseInt(partnerId)));
                }

            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [user, partnerId]);

    const loadMoreMessages = async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/messages/${partnerId}?skip=${skip}`,
                { headers: { "Authorization": `Bearer ${user}` } }
            );

            if (res.ok) {
                const data = await res.json();
                const newMsgs = data.messages || [];

                if (newMsgs.length === 0) {
                    setHasMore(false);
                } else {
                    const container = messagesContainerRef.current;
                    if (container) {
                        prevScrollHeightRef.current = container.scrollHeight;
                    }

                    setMessages(prev => [...newMsgs, ...prev]);
                    setSkip(prev => prev + newMsgs.length);
                    setHasMore(newMsgs.length === 50);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container && prevScrollHeightRef.current > 0) {
            const newScrollHeight = container.scrollHeight;
            const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
            container.scrollTop = scrollDiff;
            prevScrollHeightRef.current = 0;
        }
    }, [messages]);

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

        if (container.scrollTop < 100 && hasMore && !isLoadingMore) {
            loadMoreMessages();
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${user}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    recipientId: parseInt(partnerId),
                    text: newMessage
                })
            });

            if (res.ok) {
                const msgRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages/${partnerId}`, {
                    headers: { "Authorization": `Bearer ${user}` }
                });
                const msgData = await msgRes.json();
                if (msgRes.ok) setMessages(msgData.messages || []);
                setNewMessage("");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddFriend = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/friends/requests/add/${partnerId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${user}` }
            });
            if (res.ok) {
                setIsFriend(true)
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleBlockUser = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/friends/block/${partnerId}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${user}` }
            });
            if (res.ok) {
                setIsBlocked(true);
                setIsFriend(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUnblockUser = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/friends/${partnerId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${user}` }
            });
            if (res.ok) {
                setIsBlocked(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <section className="flex flex-col h-full bg-zinc-800 relative">
            <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 bg-zinc-900 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-white font-bold text-lg">{partner?.username}</h2>
                        <p className="text-xs text-zinc-500 max-w-xs truncate">{partner?.aboutMe}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {!isFriend && !isBlocked && (
                        <button
                            onClick={handleAddFriend}
                            className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
                        >
                            <UserPlus className="w-4 h-auto" />
                            <span className="hidden sm:inline">Add Friend</span>
                        </button>
                    )}

                    {isBlocked ? (
                        <button
                            onClick={handleUnblockUser}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded-md transition-colors"
                        >
                            <Unlock className="w-4 h-auto" />
                            <span className="hidden sm:inline">Unblock</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleBlockUser}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-red-400 hover:text-red-300 text-sm rounded-md transition-colors"
                        >
                            <Ban className="w-4 h-4" />
                            <span className="hidden sm:inline">Block</span>
                        </button>
                    )}
                </div>
            </header>

            <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 space-y-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-zinc-500">Loading conversation...</div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 opacity-50">
                        <p>No messages yet.</p>
                        <p className="text-sm">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isDifferentDay = index === 0 ||
                            new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();

                        const isMe = msg.senderId !== parseInt(partnerId);

                        return (
                            <div key={msg.id} className="flex flex-col">
                                {isDifferentDay && (
                                    <div className="relative flex items-center justify-center my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-zinc-700"></div>
                                        </div>
                                        <span className="relative bg-zinc-800 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            {formatDate(msg.createdAt)}
                                        </span>
                                    </div>
                                )}

                                <div className={`flex flex-col mb-1 ${isMe ? "items-end" : "items-start"}`}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-sm font-semibold text-zinc-300">
                                            {isMe ? "You" : partner?.username}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                    <div className={`px-4 py-2 rounded-lg max-w-[80%] sm:max-w-[70%] wrap-break-word ${isMe
                                        ? "bg-blue-600 text-white"
                                        : "bg-zinc-700 text-zinc-100"
                                        }`}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-transparent shrink-0">
                <div className="flex gap-4 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={isBlocked ? "You have blocked this user" : `Message @${partner?.username || "user"}`}
                        disabled={isBlocked}
                        className="flex-1 bg-zinc-800 text-white p-4 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 border border-zinc-700 placeholder-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isBlocked}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white p-4 rounded-md transition-colors duration-200 cursor-pointer"
                    >
                        <Send className="w-5 h-auto" />
                    </button>
                </div>
            </form>
        </section>
    );
}
