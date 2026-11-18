import Image from "next/image";
import HomeActions from "@/components/homeactions";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Image className="h-full w-full object-cover" src="/bg.svg" alt="" fill priority />
      </div>
      <div className="flex items-center justify-center fixed inset-0 m-auto">
        <Image className="object-contain" src="/logo.svg" alt="" width={384} height={123} priority />
      </div>
      <HomeActions />
    </main>
  );
}
