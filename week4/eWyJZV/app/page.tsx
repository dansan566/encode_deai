import Header from "@/app/components/header";
import ChatSection from "./components/chat-section";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="h-screen w-screen flex justify-center items-center background-gradient">
      <div className="space-y-2 lg:space-y-10 w-[90%] lg:w-[60rem]">
        <Header />
        <div className="h-[65vh] flex">
          <ChatSection />
        </div>
        <div className="space-y-4">
          <Link 
            href="/characters" 
            className="block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Character Extraction
          </Link>
        </div>
      </div>
    </main>
  );
}
