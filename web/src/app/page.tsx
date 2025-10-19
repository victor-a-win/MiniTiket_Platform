import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-5xl font-extrabold text-purple-700">Selamat Datang!</h1>
      <p className="mt-4 text-lg text-gray-700">Selamat datang di portal Mini-Tiket.</p>
      <div className="mt-8 space-x-4">
        <Link href="/events" className="px-4 py-2 bg-purple-700 text-white rounded-lg">Lihat Event</Link>
        <Link href="/transactions" className="px-4 py-2 bg-gray-700 text-white rounded-lg">Cek Transaksi</Link>
      </div>
    </div>
  );
}
