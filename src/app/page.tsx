import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <h1 className="text-text-main text-center pt-20 text-2xl font-bold">
        Evanesce
      </h1>
      <Navbar />
      <div className="flex gap-2">
        <Button variant="primary" size="sm">
          Accept
        </Button>
        <Button variant="destructive" size="sm">
          Decline
        </Button>
        <Button variant="secondary" size="sm">
          Decline
        </Button>
      </div>
    </main>
  );
}
