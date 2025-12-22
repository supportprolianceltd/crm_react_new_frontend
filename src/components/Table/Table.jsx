import { motion, AnimatePresence } from "framer-motion";
import { SkeletonRow } from "../SkeletonLoader";
import EmptyState from "../EmptyState";
import Pagination from "./Pagination";
import "./styles.css";

const Table = ({
  columns,
  data,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onRowClick,
  rowClickMode = "id", // 'id' | 'item'
  emptyStateIcon,
  emptyStateMessage,
  emptyStateDescription,
}) => {
  const getRowClickPayload = (item) => {
    return rowClickMode === "item" ? item : item.id;
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonRow key={index} columns={columns.length} />
              ))}
            </>
          ) : data?.length > 0 ? (
            <AnimatePresence>
              {data.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onRowClick?.(getRowClickPayload(item))}
                  className={onRowClick ? "clickable-row" : ""}
                >
                  {columns.map((column) => (
                    <td
                      key={`${item.id}-${column.key}`}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  icon={emptyStateIcon}
                  message={emptyStateMessage}
                  description={emptyStateDescription}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {!isLoading && data?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default Table;
