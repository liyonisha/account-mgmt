import Link from "next/link";
import { useRouter } from "next/router";
import "../styles/globals.css";
import { ToastProvider } from "../components/ToastProvider";

function NavLink({ href, children }) {
  const router = useRouter();
  const active = router.pathname === href;
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm font-medium ${
        active
          ? "bg-indigo-100 text-indigo-800"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

export default function MyApp({ Component, pageProps }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-col w-60 bg-white border-r border-slate-200 shadow-sm">
          <div className="px-4 py-4 border-b border-slate-200">
            <Link href="/" className="block text-lg font-semibold text-slate-900">
              Account Management
            </Link>
            
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/accounts">Accounts</NavLink>
            <NavLink href="/invoices">Invoices</NavLink>
            <NavLink href="/payments">Payments</NavLink>
            <NavLink href="/vouchers">Vouchers</NavLink>
            <NavLink href="/reports">Income Statement</NavLink>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Top bar for small screens */}
          <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
              <Link href="/" className="font-semibold text-base text-slate-900">
                Account Management
              </Link>
            </div>
          </header>
          <main className="px-4 py-6 md:px-8 md:py-8">
            <div className="max-w-5xl mx-auto">
              <Component {...pageProps} />
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

