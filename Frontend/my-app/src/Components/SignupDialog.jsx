export default function SignupDialog({ setRole }) {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-96 text-center">
      <h2 className="text-xl font-semibold mb-6">Sign up as</h2>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setRole("student")}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
        >
          Student
        </button>
        <button
          onClick={() => setRole("admin")}
          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
        >
          Club Admin
        </button>
      </div>
    </div>
  );
}
