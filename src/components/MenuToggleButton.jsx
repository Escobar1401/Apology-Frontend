import './MenuButton.css';
import menuIcon from '../assets/menu.svg';

function MenuToggleButton({ onClick }) {
  return (
    <button className="menubutton" onClick={onClick}>
      <img src={menuIcon} alt="Menú" />
    </button>
  );
}

export default MenuToggleButton;
