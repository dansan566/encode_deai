// pages/page.tsx
import CharacterTable from "../components/CharacterTable";
import AIPrompt from "../components/AIPrompt";

// application's main page, rendering the HTML without any logic
export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">KshRM4 Story Builder (WiP)</h1>
      <CharacterTable />
      <AIPrompt />
    </div>
  );
}