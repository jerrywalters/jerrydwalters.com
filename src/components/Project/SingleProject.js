import React from 'react';
import { browserHistory } from 'react-router';
import dickPic from '../../images/dickpic.png';

const SingleProject = () => {
    function backHome() {
        browserHistory.push('/')
    }
    document.addEventListener("click", backHome);
    return (
        <div className="project-single slide-in">
            <section className="project-about">
                <h2 className="project-about__heading--primary">Lame Project</h2>
                <a className="project-about__link">www.gavinfoster.com</a>
                <h3 className="project-about__heading--secondary">Technology</h3>
                <p className="project-about__body">used some sicc tech brah</p>
                <h3 className="project-about__heading--secondary">Description</h3>
                <p className="project-about__body">this project was fucking lame</p>
            </section>
            <section className="project-images">
                <img className="project-image__single" src={dickPic} />
                <img className="project-image__single" src={dickPic} />
                <img className="project-image__single" src={dickPic} />
            </section>
        </div>
    )
}

export default SingleProject