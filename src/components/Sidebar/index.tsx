import { useTranslation } from "react-i18next";

export type Page = "translate" | "api" | "settings" | "about";

type SidebarProps = {
  activePage: Page;
  onPageChange: (page: Page) => void;
};

const pages: Array<{ id: Page; label: string }> = [
  { id: "translate", label: 'sidebar.translate' },
  { id: "api", label: 'sidebar.api' },
  { id: "settings", label: 'sidebar.settings' },
  { id: "about", label: 'sidebar.about' },
];

function Sidebar({ activePage, onPageChange }: SidebarProps) {

  const { t } = useTranslation();

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
            {t(page.label)}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;