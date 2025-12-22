import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import "./styles.css";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const [goToPage, setGoToPage] = useState("");

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handleGoToPage = () => {
    const page = parseInt(goToPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGoToPage("");
    }
  };

  // Generate page buttons, showing only a subset for better UX
  const maxVisiblePages = 5;
  const pageRange = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(1, currentPage - pageRange);
  let endPage = Math.min(totalPages, currentPage + pageRange);

  if (endPage - startPage < maxVisiblePages - 1) {
    if (currentPage < totalPages / 2) {
      endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    } else {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="pagination">
      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageClick(currentPage - 1)}
          className="pagination-button"
        >
          &lt;
        </button>
        {startPage > 1 && (
          <>
            <button
              className={1 === currentPage ? "active" : ""}
              onClick={() => handlePageClick(1)}
            >
              1
            </button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}
        {pages.map((page) => (
          <button
            key={page}
            className={page === currentPage ? "active" : ""}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              className={totalPages === currentPage ? "active" : ""}
              onClick={() => handlePageClick(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageClick(currentPage + 1)}
          className="pagination-button"
        >
          &gt;
        </button>
      </div>
      {totalPages > 1 && (
        <div className="pagination-extra">
          <span>
            Go to page:
            <input
              type="number"
              min="1"
              max={totalPages}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
              className="pagination-input"
            />
            <button onClick={handleGoToPage} className="pagination-go-button">
              Go
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
