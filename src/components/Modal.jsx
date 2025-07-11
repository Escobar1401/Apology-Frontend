import { useEffect } from 'react';
import './Modal.css';

function Modal({ title, content, onClose }) {
    // Close modal when clicking outside the modal content
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Close modal when pressing Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div 
            className="modal-overlay" 
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
        >
            <div className="modal-box">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="modal-close"
                        aria-label="Cerrar modal"
                    >
                        ✖
                    </button>
                </div>
                <div className="modal-content">
                    {content}
                </div>
            </div>
        </div>
    );
}

export default Modal;
