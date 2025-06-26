import './PrimaryButton.css';

function PrimaryButton({ text, type = 'button' }) {
    return (
        <button type={type} className='primary-button' onClick={() => {}}>
            <span>{text}</span>
        </button>
    )
}


export default PrimaryButton; 