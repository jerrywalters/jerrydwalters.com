import React from 'react';
import { browserHistory } from 'react-router';
import classNames from 'classnames';

const Header = ({ location }) => {
  const headerClasses = classNames({
    'header' : true,
    'header--stuck' : location.pathname !=='/'
  });

  return (
    <header className={ headerClasses }>
      <div className="header__top">
        <section className="header__bio">
        <p>
            I am the lord of lords.
        </p>
        </section>
        <img src="" className="header__pic" />
        <div className="header__links">

        </div>
      </div>
    </header>
  )
}

export default Header;