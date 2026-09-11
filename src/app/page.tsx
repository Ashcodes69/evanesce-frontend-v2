"use client";
import Navbar from "../components/layout/Navbar";
import IncomingRequests from "../features/connections/IncomingRequests";
import SearchPanel from "../features/connections/SearchPanel";
import SearchResult from "../features/connections/SearchResult";

export default function Home() {
  return (
    <main className="min-h-screen bg-background pb-24 px-6 pt-0">
      <div className="max-w-xl mx-auto w-full flex flex-col gap-12">
        <h1 className="text-text-main text-center pt-5 text-2xl font-bold">
          Evanesce
        </h1>
        <Navbar />
        <SearchPanel />
        <SearchResult
          hasSearched={true}
          user={{ id: "1", fullName: "Ashish Kumar", username: "ashish" }}
        />
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-primary text-sm font-semibold">
              Chat requests
            </h2>
            {/* A nice touch: showing the count */}
            <span className="bg-surface border border-border text-text-muted text-xs px-2 py-0.5 rounded-full">
              3 new
            </span>
          </div>

          <IncomingRequests
            requests={[
              { id: "1", fullName: "Eliot Alderson", username: "eliot" },
              { id: "2", fullName: "Dexter Morgan", username: "dexter" },
              { id: "3", fullName: "Tony Stark", username: "tony" },
            ]}
            onAccept={(id) => console.log("Accepted:", id)}
            onDecline={(id) => console.log("Declined:", id)}
          />
        </section>
      </div>
    </main>
  );
}
