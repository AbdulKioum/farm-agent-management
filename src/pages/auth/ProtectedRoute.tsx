import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { role, loading } = useAuth(); // loading যোগ করা হয়েছে
  const location = useLocation();

  // ১. সেশন লোড হওয়া পর্যন্ত রিডাইরেক্ট না করে লোডার দেখানো
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ২. লোডিং শেষ হওয়ার পর যদি role না থাকে (লগইন করা না থাকে)
  if (!role) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // ৩. রোল থাকলেও অনুমতি (Permission) না থাকলে
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}