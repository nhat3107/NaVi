import { useEffect, useRef, useState } from "react";
import { searchUsers } from "../../lib/api";

export default function CreateGroupModal({ open, onClose, onSubmit }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => dialogRef.current?.focus(), 0);
    } else {
      setGroupName("");
      setSelectedUserIds([]);
      setSelectedUsers([]);
      setError("");
      setQuery("");
      setResults([]);
    }
  }, [open]);

  function handleSubmit(e) {
    e.preventDefault();
    const name = groupName.trim();
    if (!name) {
      setError("Please enter a group name");
      return;
    }
    if (selectedUserIds.length < 2) {
      setError("Please select at least 2 members");
      return;
    }
    setError("");
    onSubmit?.({ name, memberIds: selectedUserIds });
  }

  function toggleSelect(id) {
    setSelectedUserIds((prev) => {
      const adding = !prev.includes(id);
      const nextIds = adding ? [...prev, id] : prev.filter((x) => x !== id);
      return nextIds;
    });
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u._id === id);
      if (exists) {
        return prev.filter((u) => u._id !== id);
      }
      const found = results.find((u) => u._id === id);
      if (found) {
        return [
          ...prev,
          {
            _id: found._id,
            username: found.username,
            avatarUrl: found.avatarUrl,
          },
        ];
      }
      return prev;
    });
  }

  const isValid = groupName.trim().length > 0 && selectedUserIds.length >= 2;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-title"
        tabIndex={-1}
        ref={dialogRef}
        className="relative z-40 w-11/12 max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700"
      >
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3
              id="create-group-title"
              className="text-lg font-semibold text-gray-800 dark:text-gray-100"
            >
              Create new group
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 dark:text-gray-300 text-xl"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Group name
          </label>
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Select members
            </p>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users by name..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 mb-2"
            />
            <button
              type="button"
              onClick={async () => {
                if (query.trim().length < 2) return;
                setLoading(true);
                try {
                  const res = await searchUsers(query.trim());
                  setResults(res.users || []);
                } finally {
                  setLoading(false);
                }
              }}
              className="mb-3 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              Search
            </button>
            {selectedUsers.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700"
                  >
                    <img
                      src={u.avatarUrl}
                      alt={u.username}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-200">
                      {u.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSelect(u._id)}
                      className="text-xs text-gray-500 hover:text-red-600"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-auto pr-1">
              {loading && (
                <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                  Searching...
                </div>
              )}
              {results.map((user) => {
                const selected = selectedUserIds.includes(user._id);
                return (
                  <button
                    type="button"
                    key={user._id}
                    onClick={() => toggleSelect(user._id)}
                    className={`flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ${
                      selected
                        ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {user.username}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email || ""}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      readOnly
                      checked={selected}
                      className="w-4 h-4"
                    />
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Please select at least 2 members.
            </p>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`px-4 py-2 rounded-lg text-white ${
                isValid
                  ? "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
                  : "bg-indigo-300 dark:bg-indigo-800 cursor-not-allowed"
              }`}
            >
              Create group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
