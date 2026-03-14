"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, LayoutDashboard, PlusCircle, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  criticalCount?: number;
}

export default function Navbar({ criticalCount = 0 }: NavbarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Home", icon: <Activity size={16} /> },
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { href: "/new-case", label: "New Case", icon: <PlusCircle size={16} /> },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-navbar sticky top-0 z-50 px-6 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-black font-black text-sm shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
              T
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 opacity-0 group-hover:opacity-30 blur-md transition-opacity" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">Triage</span>
            <span className="text-lg font-bold gradient-text tracking-tight">IQ</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "bg-teal-500/15 text-teal-400 shadow-inner"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {criticalCount > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold"
            >
              <AlertTriangle size={12} className="animate-pulse" />
              {criticalCount} Critical
            </motion.div>
          )}

          <Link
            href="/new-case"
            className="hidden md:flex btn-primary !py-2 !px-4 !text-sm"
          >
            <PlusCircle size={15} />
            New Case
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden mt-3 pb-3 border-t border-white/5 pt-3"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
}
