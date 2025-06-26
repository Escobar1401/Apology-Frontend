import './QuaternaryButton.css';

function QuaternaryButton({ text, onClick }) {
  return (
    <button className='quaternary-button' onClick={onClick}>
      <span>{text}</span>
    </button>
  );
}

export default QuaternaryButton;