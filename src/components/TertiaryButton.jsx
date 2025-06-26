import './TertiaryButton.css';

function TertiaryButton({ text, onClick }) {
  return (
    <button className='tertiary-button' onClick={onClick}>
      <span>{text}</span>
    </button>
  );
}

export default TertiaryButton;