export default function Footer() {
  return (
    <footer className="mt-12 text-center text-sm text-gray-600">
      <p>© {new Date().getFullYear()} Precision Baking. All rights reserved.</p>
      <div className="mt-2">
        <a href="#" className="text-primary mx-2 hover:underline">Privacy Policy</a>
        <a href="#" className="text-primary mx-2 hover:underline">Terms of Service</a>
        <a href="#" className="text-primary mx-2 hover:underline">Contact</a>
      </div>
    </footer>
  );
}
