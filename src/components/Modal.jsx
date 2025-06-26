import './Modal.css';

function Modal({ title, content, onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="modal-close">✖</button>
                </div>
                <div className="modal-content">
                    {content}
                </div>
            </div>
        </div>
    );
}

export default Modal;
