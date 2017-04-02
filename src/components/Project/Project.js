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
    }

    var doc = window.document,
    context = doc.getElementsByClassName('project-images')[0],
    clones = context.getElementsByClassName('project-images__item--clone'),
    disableScroll = false,
    scrollHeight = 0,
    scrollPos = 0,
    clonesHeight = 0,
    i = 0;
    setScrollPos(1);

    function getScrollPos() {
      return (context.pageYOffset || context.scrollTop) - (context.clientTop || 0);
    }

    function setScrollPos(pos) {
      context.scrollTop = pos;
    }

    function getClonesHeight() {
      clonesHeight = 0;
      i = 0;

      for (i; i < clones.length; i += 1) {
        clonesHeight = clonesHeight + clones[i].offsetHeight;
      }

      return clonesHeight;
    }

    function reCalc() {
      scrollPos = getScrollPos();
      scrollHeight = context.scrollHeight;
      clonesHeight = getClonesHeight();

      if (scrollPos <= 0) {
        setScrollPos(1); // Scroll 1 pixel to allow upwards scrolling
      }
    }

    // Calculate variables
    window.requestAnimationFrame(reCalc);

    function scrollUpdate() {
      if (!disableScroll) {
        scrollPos = getScrollPos();
        if (clonesHeight + scrollPos >= scrollHeight) {
          setScrollPos(1); // Scroll down 1 pixel to allow upwards scrolling
          disableScroll = true;
        } else if (scrollPos <= 0) {
          // Scroll to the bottom when you reach the top
          setScrollPos(scrollHeight - clonesHeight - 1);
          disableScroll = true;
          }
        }

        if (disableScroll) {
          // Disable scroll-jumping for a short time to avoid flickering
          window.setTimeout(function () {
            disableScroll = false;
          }, 40);
        }
      }

      context.addEventListener('scroll', function () {
        window.requestAnimationFrame(scrollUpdate);
      }, false);

      window.addEventListener('resize', function () {
        window.requestAnimationFrame(reCalc);
      }, false);
    }

  render() {

    const { location } = this.props;
    const { name, links, description, images, technology, backgroundColor, description2 } = this.props.project;

    // assuming atleast two images, copy for infinite loop
    // cloning two images for looping scroll
    const imgsArray = Array.isArray(images) ? [...images, images[0], images[1]] : [];
    let projectImages = imgsArray.map((img, index) => {
      let imgClass = classNames({
        'project-images__item': true,
        'project-images__item--clone': imgsArray.length - index <= 2,
      });
      return (
        <div key={index} className={imgClass}>
          <img className="project-images__single" srcSet={img} />
         </div>
      )
    });

    const projectClasses = classNames({
			'project-single': true,
	  });

    // let projectImages = images.map((img, index) => <img key={index} className="project-images__single" src={img} /> );

    let projectLinks = links.map((link, index) => <li key={index}><a className="project-about__link" href={link} target="_blank" onClick={e => e.stopPropagation()}>{link}</a></li>);

    let projectTech = technology.map((tech, index) => {
      return (
        <li key={ index } className="project-tech__item"><a className="project-tech__link" target="_blank" href={tech.link}>{ tech.name }</a></li>
      )
    });

    function stopClickThrough(e){
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      window.browserHistory.push('/')
    }

    return (
      <div className={projectClasses} onClick={(e) => stopClickThrough(e)}>
        <section className="project-about" style={{backgroundColor: backgroundColor}}>
          <h2 className="project-about__heading--primary">{name}</h2>
          <p className="project-about__body">{ description }</p>
          { description2 ? <p className="project-about__body">{ description2 }</p> : '' }
          <div className="project-about__container">
            <div className="project-about__section project-about__section--tech">
              <h3 className="project-about__heading--secondary">technology</h3>
              <ul className="project-tech" onClick={e => e.stopPropagation()}>
                { projectTech }
              </ul>
            </div>
            <div className="project-about__section project-about__section--links">
              <h3 className="project-about__heading--secondary" >links</h3>
              <ul className="project-links">
                { projectLinks }
              </ul>
            </div>
          </div>
        </section>
        <div className="project-images__container">
          <section className="project-images">
            { projectImages }
          </section>
        </div>
      </div>
    )
  }

}

export default Project