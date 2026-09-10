import Navbar from "../components/layout/Navbar";
import SearchPanel from "../features/connections/SearchPanel";
import SearchResult from "../features/connections/SearchResult";

export default function Home() {
  return (
    <main className="min-h-screen bg-background pb-24 px-6 pt-12">
      <div className="max-w-xl mx-auto w-full flex flex-col gap-12">
        <h1 className="text-text-main text-center pt-20 text-2xl font-bold">
          Evanesce
        </h1>
        <Navbar />
        <SearchPanel />
        <SearchResult
          hasSearched={true}
          user={{ id: "1", fullName: "Ashish Kumar", username: "ashish" }}
        />
      </div>
    </main>
  );
}
