import React from 'react';
import { browserHistory } from 'react-router';

const SingleProject = () => {
    function backHome() {
        browserHistory.push('/')
    }
    document.addEventListener("click", backHome);
    return (
        <div>
        MILORD
        </div>
    )
}

export default SingleProject