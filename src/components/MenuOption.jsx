import { Link } from 'react-router-dom';
import './MenuOption.css';

function MenuOption({ text, link, onClick }) {
  return (
    <Link to={`/${link}`} className="menu-option" onClick={onClick}>
      {text}
    </Link>
  );
}


export default MenuOption;
