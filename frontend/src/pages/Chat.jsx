import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/Authcontext";
import { getSocket } from "../services/socket";
import api from "../services/api";
import UserList from "../components/Userlist";
import MessageList from "../components/MessageList";
import MessageInput from "../components/Messageinput";

const getInitial = (username) => username?.[0]?.toUpperCase() || "?";

export default function Chat() {
  const { user, logout, onlineUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    api.get("/auth/users").then(({ data }) => setUsers(data));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const msgSender   = msg.senderId?.toString();
      const msgReceiver = msg.receiverId?.toString();
      const myId        = user._id?.toString();
      const otherId     = selectedUser?._id?.toString();

      const isRelevant =
        (msgSender === otherId && msgReceiver === myId) ||
        (msgSender === myId   && msgReceiver === otherId);

      if (isRelevant) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id?.toString() === msg._id?.toString());
          return exists ? prev : [...prev, msg];
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [selectedUser, user._id]);

  const selectUser = useCallback(async (u) => {
    setSelectedUser(u);
    setLoadingMessages(true);
    setSidebarOpen(false);
    try {
      const { data } = await api.get(`/messages/${u._id}`);
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const socket = getSocket();
      if (!socket || !selectedUser) return;
      socket.emit("sendMessage", {
        senderId: user._id,
        receiverId: selectedUser._id,
        text,
      });
    },
    [selectedUser, user._id]
  );

  const isSelectedOnline = selectedUser && onlineUsers.includes(selectedUser._id?.toString());

  return (
    <div className="h-screen flex flex-col bg-ink-950">
      <header className="flex items-center justify-between px-4 py-3 border-b border-ink-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="md:hidden btn-ghost p-1 mr-1"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="font-mono text-sm text-ink-400 tracking-widest uppercase">
            chatter
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-ink-400 text-sm hidden sm:block">{user.username}</span>
          <button
            onClick={logout}
            className="font-mono text-xs text-ink-500 hover:text-ink-300 uppercase tracking-wider transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside
          className={`${
            sidebarOpen ? "flex" : "hidden"
          } md:flex flex-col w-64 border-r border-ink-800 flex-shrink-0 absolute md:relative z-10 bg-ink-950 h-full md:h-auto`}
        >
          <UserList
            users={users}
            selectedUser={selectedUser}
            onSelect={selectUser}
          />
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-ink-900 border border-ink-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6 text-ink-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <p className="text-ink-600 text-sm">Select a person to start chatting</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-800 flex-shrink-0">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center text-sm font-medium">
                    {getInitial(selectedUser.username)}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-ink-950 ${
                      isSelectedOnline ? "bg-emerald-400" : "bg-ink-600"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-100">{selectedUser.username}</p>
                  <p className="text-xs text-ink-500">{isSelectedOnline ? "online" : "offline"}</p>
                </div>
              </div>

              <MessageList messages={messages} loading={loadingMessages} />
              <MessageInput onSend={sendMessage} disabled={false} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}