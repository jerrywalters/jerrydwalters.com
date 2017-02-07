import React from 'react';
import { browserHistory } from 'react-router';

const SingleProject = () => {
    function backHome() {
        browserHistory.push('/')
    }
    return (
        <div>
        MILORD!
        <button onClick={e => backHome(e)}>GO BACK MILORD</button>
        </div>
    )
}

export default SingleProject