export default function AdminSignupForm() {
  return (
    <form className="bg-white shadow-lg rounded-2xl p-8 w-96">
      <h2 className="text-xl font-semibold mb-6 text-center">Club Admin Signup</h2>
      <input
        type="text"
        placeholder="Club Name"
        className="w-full border p-2 mb-4 rounded-lg"
      />
      <input
        type="email"
        placeholder="Admin Email"
        className="w-full border p-2 mb-4 rounded-lg"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 mb-4 rounded-lg"
      />
      <button
        type="submit"
        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
      >
        Sign Up
      </button>
    </form>
  );
}
