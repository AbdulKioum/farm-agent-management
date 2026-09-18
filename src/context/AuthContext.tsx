import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  role: string;
  userName: string;
  email: string;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  role: "",
  userName: "",
  email: "",
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchUserProfile(
            session.user.id,
            session.user.email || "",
            session.user.user_metadata
          );
        } else {
          clearState();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  function clearState() {
    setRole("");
    setUserName("");
    setEmail("");
    setLoading(false);
  }

  async function checkSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await fetchUserProfile(
          session.user.id,
          session.user.email || "",
          session.user.user_metadata
        );
      } else {
        clearState();
      }
    } catch (error) {
      console.error("Auth session check error:", error);
      clearState();
    }
  }

  async function fetchUserProfile(
    userId: string,
    userEmail: string,
    userMetadata?: Record<string, any>
  ) {
    try {
      setLoading(true);

      let { data, error } = await supabase
        .from("users")
        .select("full_name, role, email")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Supabase query error:", error.message);
      }

      if (!data && userEmail) {
        const { data: dataByEmail } = await supabase
          .from("users")
          .select("full_name, role, email")
          .eq("email", userEmail)
          .maybeSingle();

        data = dataByEmail;
      }

      if (data && data.role) {
        setRole(data.role);
        setUserName(data.full_name || userEmail);
        setEmail(data.email || userEmail);
      } else {
        const fallbackRole = userMetadata?.role || "viewer";
        const fallbackName = userMetadata?.full_name || userEmail;

        setRole(fallbackRole);
        setUserName(fallbackName);
        setEmail(userEmail);
      }
    } catch (err) {
      console.error("Profile fetch exception:", err);
      setRole("viewer");
      setUserName(userEmail);
      setEmail(userEmail);
    } finally {
      setLoading(false);
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    clearState();
  };

  return (
    <AuthContext.Provider value={{ role, userName, email, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);