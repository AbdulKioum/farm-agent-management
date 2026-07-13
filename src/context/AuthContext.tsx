import {
  createContext,
  useContext,
} from "react";

export const AuthContext =
  createContext({
    role: "",
    userName: "",
  });

export const useAuth = () =>
  useContext(AuthContext);