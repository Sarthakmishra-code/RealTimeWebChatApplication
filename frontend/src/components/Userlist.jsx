import { useAuth } from "../context/Authcontext";

const getInitial = (username) => username?.[0]?.toUpperCase() || "?";

const hues = [
  "bg-rose-800",
  "bg-sky-800",
  "bg-emerald-800",
  "bg-violet-800",
  "bg-orange-800",
  "bg-teal-800",
];
const getColor = (str) => hues[(str?.charCodeAt(0) || 0) % hues.length];

export default function UserList({ users, selectedUser, onSelect }) {
  const { onlineUsers } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-ink-800">
        <h2 className="font-mono text-xs text-ink-400 uppercase tracking-widest">
          People
        </h2>
      </div>
      <ul className="flex-1 overflow-y-auto py-2">
        {users.length === 0 && (
          <p className="text-ink-600 text-sm text-center mt-8 px-4">
            No other users yet
          </p>
        )}
        {users.map((u) => {
          const isOnline = onlineUsers.includes(u._id?.toString());
          const isSelected = selectedUser?._id === u._id;
          return (
            <li key={u._id}>
              <button
                onClick={() => onSelect(u)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-150 ${
                  isSelected
                    ? "bg-ink-800 text-ink-50"
                    : "hover:bg-ink-900 text-ink-300"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white ${getColor(u.username)}`}
                  >
                    {getInitial(u.username)}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-ink-950 ${
                      isOnline ? "bg-emerald-400" : "bg-ink-600"
                    }`}
                  />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium truncate">{u.username}</p>
                  <p className="text-xs text-ink-500">
                    {isOnline ? "online" : "offline"}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}