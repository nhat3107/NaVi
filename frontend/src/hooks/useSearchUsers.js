import { useState, useEffect } from "react";
import { searchUsers } from "../lib/api";

export const useSearchUsers = (searchTerm, delay = 300) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setUsers([]);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await searchUsers(searchTerm.trim());
        setUsers(response.users || []);
      } catch (err) {
        console.error("Error searching users:", err);
        setError(err.response?.data?.message || "Failed to search users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, delay]);

  return { users, loading, error };
};
