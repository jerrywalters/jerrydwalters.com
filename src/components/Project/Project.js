import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import classNames from 'classnames';

// import { projects } from '../../projects.js';

class Project extends Component {
	constructor(props){
    super(props);
  }

  render() {
    const { location } = this.props;
    console.log('current project', this.props)
    const { name, links, description, images, technology } = this.props.project;
    const projectClasses = classNames({
			'project-single': true,
			'slide-in' : location.pathname===`/project/${name}`
	  });

    let projectImages = images.map((img, index) => <img key={index} className="project-images__single" src={img} /> );

    let projectLinks = links.map((link, index) => <a key={index} className="project-about__link" href={link}>{link}</a>);

    let projectTech = technology.map((tech, index) => {
      return (
        <li key={ index } className="project-tech__item"><a className="project-tech__link" target="_blank" href={tech.link}>{ tech.name }</a></li>
      )
    });

    return (
      <div className={projectClasses}>
        <section className="project-about">
          <h2 className="project-about__heading--primary">{name}</h2>
          <p className="project-about__body">{ description }</p>
          <h3 className="project-about__heading--secondary">Technology:</h3>
          <ul className="project-tech">
            { projectTech }
          </ul>
          { projectLinks }
        </section>
        <section className="project-images">
          { projectImages }
        </section>
      </div>
    )
  }

}

export default Project