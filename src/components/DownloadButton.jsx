import React from 'react'
import download from '../assets/download.svg';
import './DownloadButton.css';

function DownloadButton({ onClick }) {
    return (
        <button className="download-button" onClick={onClick}>
            <img className="download-icon" src={download} />
        </button>
    );
}

export default DownloadButton;
