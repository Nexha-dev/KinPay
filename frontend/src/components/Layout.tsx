import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouter();
  const nav = [
    { href: '/', label: 'Dashboard' },
    { href: '/create-remittance', label: 'Send Money' },
    { href: '/recipient-view', label: 'Recipient' },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <header className="border-b border-white/10 bg-[#0f1117]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">K</div>
            <span className="font-semibold text-white text-lg tracking-tight">KinPay</span>
          </div>
          <nav className="flex items-center gap-1">
            {nav.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
