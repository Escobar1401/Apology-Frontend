import './SecondaryButton.css';

function SecondaryButton({ text, onClick }) {
  return (
    <button className='secondary-button' onClick={onClick}>
      <span>{text}</span>
    </button>
  );
}

export default SecondaryButton;