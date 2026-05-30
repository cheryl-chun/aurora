export type Page = "translate" | "api" | "settings" | "about";

type SidebarProps = {
  activePage: Page;
  onPageChange: (page: Page) => void;
};

const pages: Array<{ id: Page; label: string }> = [
  { id: "translate", label: "翻译" },
  { id: "api", label: "API" },
  { id: "settings", label: "设置" },
  { id: "about", label: "关于" },
];

function Sidebar({ activePage, onPageChange }: SidebarProps) {
  return (
    <aside className="h-screen border-r border-slate-200 bg-white px-3 py-4">
      <div className="mb-6 px-2 text-lg font-semibold">Aurora</div>

      <nav className="grid gap-1">
        {pages.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => onPageChange(page.id)}
            className={[
              "h-9 rounded-md px-3 text-left text-sm transition",
              activePage === page.id
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            ].join(" ")}
          >
            {page.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;