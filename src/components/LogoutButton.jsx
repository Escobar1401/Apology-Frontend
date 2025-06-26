import './LogoutButton.css';
import logoutIcon from '../assets/logout.svg';

function LogoutButton({ onClick }) {
  return (
    <div className="logoutbutton" onClick={onClick}>
      <img src={logoutIcon} alt="icon" />
    </div>
  );
}

export default LogoutButton;
