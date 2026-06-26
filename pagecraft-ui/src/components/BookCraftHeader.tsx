import { useNavigate } from "react-router";

type BookCraftHeaderProps = {
  loading: boolean;
  title: string;
};

function BookCraftHeader({ loading, title }: BookCraftHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-brutal-paper px-4 py-4">
      <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap px-4">
        <button
          onClick={() => navigate("/gallery")}
          className="hidden sm:inline-flex items-center gap-1.5 font-bold text-[13px] border-[2.5px] border-brutal-ink rounded-lg px-3 py-2 shadow-[3px_3px_0_#161616] bg-brutal-paper transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#161616] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#161616]"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Gallery
        </button>
        <div className="w-10 h-10 flex-shrink-0 rounded-lg border-[2.5px] border-brutal-ink shadow-[2px_2px_0_#161616] bg-brutal-yellow flex items-center justify-center font-extrabold text-[13px]">
          PC
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 leading-tight">
            Book crafting
          </p>
          <h1 className="text-[18px] sm:text-[19px] font-extrabold leading-tight truncate">
            {loading ? "Loading..." : title}
          </h1>
        </div>
      </div>
    </header>
  );
}

export default BookCraftHeader;
