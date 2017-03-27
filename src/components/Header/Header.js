import React from 'react';
import { browserHistory } from 'react-router';
import classNames from 'classnames';
import portrait from '../../images/portrait-small.jpg'

const Header = ({ location }) => {
  const headerClasses = classNames({
    'header' : true,
    'header--stuck' : location.pathname !=='/'
  });

  function stopClickThrough(e){
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }

  return (
    <header className={ headerClasses } onClick={(e) => stopClickThrough(e)}>
      <div className="header__top">
        <section className="header-bio">
          <h1 className="header-bio__name">Jerry Walters</h1>
          <p className="header-bio__bio"> 
            Hi, i'm Jerry and i'm a web developer 
            <br /><br />
            My strength lies in Front End Development, 
          </p>
        </section>
        <section className="header-contact">
          <img src={portrait} className="header__portrait" />
          <div className="header-contact__container">
            <ul className="header-contact__info">
              <li className="header-contact__info--item"> jerrydwalters@gmail.com </li>
              <li className="header-contact__info--item"> (757) 318-1934 </li>
            </ul>
            <div className="header-contact__links">
              <a className="link-icon" href="http://github.com/jerrywalters"><i className="fa fa-github" aria-hidden="true"></i></a>
              <a className="link-icon link-icon--2" href="https://www.linkedin.com/in/jerry-walters-4b03a495/"><i className="fa fa-linkedin-square" aria-hidden="true"></i></a>
            </div>
          </div>
        </section>
      </div>
    </header>
  )
}

export default Header;