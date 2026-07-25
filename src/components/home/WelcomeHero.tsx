'use client';

import Image from 'next/image';
import NexusLogo from '@/assets/Logo/Logo with no circle.svg';
import { HardDrive } from 'lucide-react';

export function WelcomeHero({
  onSignup,
  onLogin,
  onGuest,
}: {
  onSignup: () => void;
  onLogin: () => void;
  onGuest: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative mb-4 h-24 w-24">
        <div className="absolute -inset-1 rounded-full" />
        <Image src={NexusLogo} alt="Nexus Logo" fill className="object-contain" />
      </div>
      <h2 className="text-center text-3xl font-bold text-white">
        Welcome to <span className="font-ka1 text-white font-light">Nexus</span>
      </h2>
      <p className="mt-3 max-w-lg text-center text-zinc-400">
        Think beyond the list. Build, link, and share interconnected graphs that turn fragmented data into a structured knowledge base. Visual, dynamic, and designed for deep exploration.
      </p>
      
      <div className="mt-8 flex gap-4">
        <button
          onClick={onSignup}
          className="rounded-lg bg-[#355ea1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#265fbd] sm:px-6 sm:py-3 cursor-pointer"
        >
          Create free account
        </button>
        <button
          onClick={onLogin}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 sm:px-6 sm:py-3 cursor-pointer"
        >
          Sign in
        </button>
      </div>

      <button
        onClick={onGuest}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-40 flex items-center justify-center gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md px-5 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white cursor-pointer shadow-xl"
      >
        <HardDrive className="h-4 w-4 text-zinc-400" />
        <span>Local Workspace (No login required)</span>
      </button>
    </div>
  );
}
