import './PrimaryButton.css';

function PrimaryButton({ text, type = 'button', onClick }) {
    return (
        <button type={type} className='primary-button' onClick={onClick}>
            <span>{text}</span>
        </button>
    )
}


export default PrimaryButton; 