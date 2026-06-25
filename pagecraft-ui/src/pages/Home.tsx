import { Link } from "react-router";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle,rgba(22,22,22,0.07)_1.5px,transparent_1.5px)] bg-[length:22px_22px] pointer-events-none"
      />
      <section className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28 flex flex-col items-center text-center">
        <div className="-rotate-2 mb-6">
          <Badge variant="yellow">AI-powered storybooks</Badge>
        </div>
        <h1 className="text-[40px] sm:text-[56px] md:text-[76px] font-extrabold leading-[0.98] tracking-tight">
          PageCraft
        </h1>
        <p className="mt-6 max-w-xl text-[15px] sm:text-[17px] font-medium text-gray-800">
          Generate illustrated children's stories with a prompt, then refine each page until it's
          exactly how you imagined it.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/gallery">
            <Button variant="primary">Create a Book</Button>
          </Link>
          <Link to="/gallery">
            <Button variant="ghost">Browse Gallery</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
