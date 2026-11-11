import Image from "next/image";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Image
            className=" h-5 w-[100px]"
            src="/bg.svg"
            alt=""
            fill
            objectFit="cover"
            priority
        />
      </div>
      <div className="flex items-center justify-center fixed inset-0 m-auto">
        <Image
            src="/logo.svg"
            alt=""
            width="384"
            height="123"
            objectFit="contain"
            priority
        />
      </div>
    </main>
  );
}
