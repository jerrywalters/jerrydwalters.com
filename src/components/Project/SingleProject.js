import React from 'react';
import { browserHistory } from 'react-router';
import classNames from 'classnames';
import dickPic from '../../images/dickpic.png';

import { projects } from '../../projects.js';

const SingleProject = () => {
    const projectClasses = classNames({
      'project-single': true,
      'slide-in' : location.pathname==='/project'
    });

    return (
        <div className={projectClasses}>
            <section className="project-about">
                <h2 className="project-about__heading--primary">{projects[0].name}</h2>
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