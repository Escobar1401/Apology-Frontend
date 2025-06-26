import "./SearchBar.css";
import searchIcon from "../assets/search.svg";

function SearchBar({ placeholder, onChange }) {
    return (
        <div className="search-container">
            <input
                type="text"
                placeholder={placeholder}
                onChange={onChange}
                className="search-input"
            />
            <img src={searchIcon} alt="" className="search-icon"/>
        </div>
    );
}

export default SearchBar;
