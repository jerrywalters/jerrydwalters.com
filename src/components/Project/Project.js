import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import classNames from 'classnames';
import dickPic from '../../images/dickpic.png';

import { projects } from '../../projects.js';

class Project extends Component {
	constructor(props){
    super(props);
  }

  render() {
    const { location } = this.props;
    console.log('current project', this.props)
    const { name, links, description, images } = this.props.project;
    const projectClasses = classNames({
			'project-single': true,
			'slide-in' : location.pathname===`/project/${name}`
	  });
    let projectImages = images.map((img, index) => {
      // let imgClass = classNames({
      //   'project-images__single' : true
      // });
      return (
        <img key={index} className="project-images__single" src={img} />
      )
    });

    return (
      <div className={projectClasses}>
        <section className="project-about">
          <h2 className="project-about__heading--primary">{name}</h2>
          <a className="project-about__link" href={links}>{links}</a>
          <h3 className="project-about__heading--secondary">Technology</h3>
          <p className="project-about__body">used some sicc tech brah</p>
          <h3 className="project-about__heading--secondary">Description</h3>
          <p className="project-about__body">this project was fucking lame</p>
        </section>
        <section className="project-images">
          { projectImages }
        </section>
      </div>
    )
  }

}

export default Project