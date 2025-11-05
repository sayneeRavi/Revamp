"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center justify-center h-screen px-6 text-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/carservice.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay to make text readable */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Hero Content */}
      <div className="relative z-10">
        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent"
        >
          Revamp Vehicle Service Booking
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto"
        >
          Hassle-free vehicle servicing at your fingertips. Book, manage, and
          track your appointments with ease.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8 flex gap-4 justify-center"
        >
          <Link href="/login">
            <button className="px-6 py-3 text-lg rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="px-6 py-3 text-lg rounded-xl bg-gray-800 text-white hover:bg-gray-900 transition shadow-lg">
              Register
            </button>
          </Link>
        </motion.div>

        {/* Development Quick Access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-6 flex gap-4 justify-center"
        >
          <Link href="/employee-dashboard">
            <button className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition shadow-lg">
              🚀 Employee Dashboard (Dev)
            </button>
          </Link>
          <Link href="/admin-dashboard">
            <button className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition shadow-lg">
              👑 Admin Dashboard (Dev)
            </button>
          </Link>
          <Link href="/consumer-dashboard">
            <button className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition shadow-lg">
              👤 Consumer Dashboard (Dev)
            </button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
