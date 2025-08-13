import './Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
            >
                Anterior
            </button>
            <span className="pagination-text">{currentPage} de {totalPages}</span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
            >
                Siguiente
            </button>
        </div>
    );
}

export default Pagination;
