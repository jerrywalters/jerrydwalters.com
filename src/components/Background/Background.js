import React from 'react';
import Shapes from './Shapes';
import classNames from 'classnames'

import skelly from '../../images/skelly.png'
import atm from '../../images/atm.png'
import stove from '../../images/stove.png'

// this has a container because that's how I could keep it from generating a background everytime routing happened
const Background = ({ openProject }) => {
    console.log('projects',window.projects)
    return (
        <div>
            <Shapes />
            <div className="bg-img-container">
                <img 
                    onClick={(e)=>openProject('portfolio-client')} 
                    className="bg-img bg-img__skelly" 
                    src={skelly} 
                    alt='skelly' />
                <img onClick={(e)=>openProject('capital-one')}
                    className="bg-img bg-img__atm" 
                    src={atm} 
                    alt='atm' />
                <img onClick={(e)=>openProject('portfolio-admin')}
                    className="bg-img bg-img__stove"
                    src={stove} 
                    alt='stove' />
            </div>
        </div>
    )
}

export default Background;