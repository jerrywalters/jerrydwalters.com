import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import classNames from 'classnames';

// import { projects } from '../../projects.js';

class Project extends Component {
	constructor(props){
    super(props);
    console.log('my props!',this.props)
  }

  componentDidUpdate() {
    
  }

  componentDidMount() {
    // let location = this.props.location.pathname
    // location.pathname===`/project/${name}` ? this.props.openProject(name)
    if(typeof this.props.params.projectName !== 'undefined' && typeof this.props.project.name === 'undefined'){
      this.props.openProject(this.props.params.projectName);
      console.log('opening bad boy')
    }
  }

  render() {
    const { location } = this.props;
    const { name, links, description, images, technology, backgroundColor, description2 } = this.props.project;
    console.log('numero2', description2)

    const projectClasses = classNames({
			'project-single': true,
	  });

    let projectImages = images.map((img, index) => <img key={index} className="project-images__single" src={img} /> );

    let projectLinks = links.map((link, index) => <a key={index} className="project-about__link" href={link} target="_blank">{link}</a>);

    let projectTech = technology.map((tech, index) => {
      return (
        <li key={ index } className="project-tech__item"><a className="project-tech__link" target="_blank" href={tech.link}>{ tech.name }</a></li>
      )
    });

    return (
      <div className={projectClasses}>
        <section className="project-about" style={{backgroundColor: backgroundColor}}>
          <h2 className="project-about__heading--primary">{name}</h2>
          <p className="project-about__body">{ description }</p>
          { description2 ? <p className="project-about__body">{ description2 }</p> : '' }
          <h3 className="project-about__heading--secondary">technology</h3>
          <ul className="project-tech">
            { projectTech }
          </ul>
          <h3 className="project-about__heading--secondary">links</h3>
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