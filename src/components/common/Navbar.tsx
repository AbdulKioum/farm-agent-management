export default function Navbar() {
  return (
    <header className="h-16 border-b flex items-center justify-between px-5">
      <h1 className="font-bold">
        Farm and Agent Management
      </h1>

      <button className="border px-4 py-2 rounded">
        Logout
      </button>
    </header>
  );
}