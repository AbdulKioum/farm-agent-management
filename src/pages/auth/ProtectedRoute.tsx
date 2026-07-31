import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth }
from "../../context/AuthContext";

export default function ProtectedRoute({

  children,

  allowedRoles,

}: {

  children: React.ReactNode;

  allowedRoles: string[];

}) {

  const {
    role,
  } =
    useAuth();

  const location =
    useLocation();

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

  if (
    !allowedRoles.includes(
      role
    )
  ) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }

  return <>{children}</>;

}