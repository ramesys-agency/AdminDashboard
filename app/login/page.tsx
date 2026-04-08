import { LoginForm } from "@/app/login/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen overflow-hidden bg-white selection:bg-primary/30">
      {/* Left Side: Visual Content (Split Screen) */}
      <div className="relative hidden w-0 flex-1 lg:block w-1/2">
        <Image
          src="/login-bg.png"
          alt="Login Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/5 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(var(--primary),0.15),transparent)]" />

        <div className="absolute inset-x-0 bottom-0 p-16 space-y-6">
          <div className="space-y-10">
            <h2 className="text-5xl font-black text-zinc-900 tracking-tighter drop-shadow-2xl">
              Elevate your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                Operations.
              </span>
            </h2>
            <p className="max-w-md text-lg text-zinc-800 font-medium leading-relaxed">
              The unified command center for Ramesys and Vydhra. Efficiency
              rediscovered through intuitive design.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Authentication Interface */}
      <div className="relative flex flex-1 flex-col w-1/2 justify-center px-6 py-12 lg:flex-none lg:px-24 xl:px-40 bg-white/90 backdrop-blur-3xl border-l border-zinc-200">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-12">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-zinc-600 font-medium">
              Manage Ramesys and Vydhra
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
