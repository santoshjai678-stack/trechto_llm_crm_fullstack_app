import { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {

  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem("user");

      if (!stored || stored === "undefined") {
        return null;
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error("Invalid user in localStorage:", error);
      localStorage.removeItem("user"); // clean corrupted value
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
