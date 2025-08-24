import { useState } from "react";
import SignupDialog from "../components/SignupDialog";
import StudentSignupForm from "../components/StudentSignupForm";
import AdminSignupForm from "../components/AdminSignupForm";

export default function Signup() {
  const [role, setRole] = useState(null); // null | "student" | "admin"

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* If no role selected → show dialog */}
      {role === null && <SignupDialog setRole={setRole} />}

      {/* If student selected → show student form */}
      {role === "student" && <StudentSignupForm />}

      {/* If admin selected → show admin form */}
      {role === "admin" && <AdminSignupForm />}
    </div>
  );
}
