import React from 'react';
import Shapes from './Shapes';
import classNames from 'classnames'

import skelly from '../../images/skelly.png'
import atm from '../../images/atm.png'
import stove from '../../images/stove.png'

// this has a container because that's how I could keep it from generating a background everytime routing happened
const Background = () => {
    return (
        <div>
            <Shapes />
            <img className="bg-img bg-img__skelly" src={skelly} alt='skelly' />
            <img className="bg-img bg-img__atm" src={atm} alt='atm' />
            <img className="bg-img bg-img__stove"src={stove} alt='stove' />
        </div>
    )
}

export default Background;