import React from 'react';
import { browserHistory } from 'react-router';
import classNames from 'classnames';

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
        </section>
        <img src="" className="header__pic" />
        <div className="header__links">

        </div>
      </div>
    </header>
  )
}

export default Header;