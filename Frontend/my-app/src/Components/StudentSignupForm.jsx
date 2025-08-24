export default function StudentSignupForm() {
  return (
    <form className="bg-white shadow-lg rounded-2xl p-8 w-96">
      <h2 className="text-xl font-semibold mb-6 text-center">Student Signup</h2>
      <input
        type="text"
        placeholder="Full Name"
        className="w-full border p-2 mb-4 rounded-lg"
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 mb-4 rounded-lg"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 mb-4 rounded-lg"
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
      >
        Sign Up
      </button>
    </form>
  );
}
