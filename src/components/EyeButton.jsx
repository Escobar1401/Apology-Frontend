import React from 'react'
import eye from '../assets/eye.svg';
import './EyeButton.css';

function EyeButton({ onClick }) {
    return (
        <button className="eye-button" onClick={onClick}>
            <img className="eye-icon" src={eye} />
        </button>
    );
}

export default EyeButton;
