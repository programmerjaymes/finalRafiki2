type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

  const safeCurrent = clamp(currentPage, 1, Math.max(1, totalPages));

  // Show up to 5 page buttons, centered around current when possible.
  const windowSize = Math.min(5, totalPages);
  let start = safeCurrent - Math.floor(windowSize / 2);
  let end = start + windowSize - 1;

  if (start < 1) {
    start = 1;
    end = windowSize;
  }

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - windowSize + 1);
  }

  const windowPages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center">
      <button
        onClick={() => onPageChange(safeCurrent - 1)}
        disabled={safeCurrent === 1}
        className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm"
      >
        Previous
      </button>
      <div className="flex items-center gap-2">
        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`flex w-10 h-10 items-center justify-center rounded-lg text-sm font-medium transition ${
                safeCurrent === 1
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500'
              }`}
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-gray-500 dark:text-gray-400">…</span>}
          </>
        )}

        {windowPages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded ${
              safeCurrent === page
                ? "bg-brand-500 text-white"
                : "text-gray-700 dark:text-gray-400"
            } flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500`}
          >
            {page}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-gray-500 dark:text-gray-400">…</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`flex w-10 h-10 items-center justify-center rounded-lg text-sm font-medium transition ${
                safeCurrent === totalPages
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      <button
        onClick={() => onPageChange(safeCurrent + 1)}
        disabled={safeCurrent === totalPages}
        className="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
