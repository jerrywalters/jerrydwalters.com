import React from 'react';
import circleBlue from './shapes/circle-blue.svg';
import circlePurple from './shapes/circle-purple.svg';
import zigzagBlue from './shapes/zigzag-blue.svg';
import zigzagPurple from './shapes/zigzag-purple.svg';
import squiggleBlue from './shapes/squiggle-blue.svg';
import squigglePurple from './shapes/squiggle-purple.svg';
// import { generateShapes } from './generateShapes'

const Shapes = () => {
    let shapes = [];
    const shapeImgs = [circleBlue, zigzagBlue, squiggleBlue, circlePurple, zigzagPurple, squigglePurple];
    let randomShape = shapeImgs[Math.floor(Math.random()*shapeImgs.length)];
    const shapeClasses = [ 'shape1', 'shape2', 'shape3', 'shape4', 'shape5', 'shape6' ];

    function getRandomShape() {
      randomShape = shapeImgs[Math.floor(Math.random()*shapeImgs.length)];
      return randomShape
    }

    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function generateShapes() {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      for(let i = 0; i <= 90; i++) {
        let newShape =       
        {
            height: getRandomInt(10, 30),
            width: getRandomInt(20, 60),
            posX: getRandomInt(1, windowWidth),
            posY: getRandomInt(1, windowHeight),
            transform: `rotate(${getRandomInt(0, 360)}deg)`,
            // color: "#"+((1<<24)*Math.random()|0).toString(16),
            // fucking lol at me being too lazy to just not make another function 
            opacity: `0.${getRandomInt(15, 70)}`
        }
        shapes.push(newShape)
      }
    }

    generateShapes();

    const generatedShapes = shapes.map(
      (shape, index) => {
        let thisShapeClass = shapeClasses[Math.floor(Math.random()*shapeClasses.length)];
        let imgStyles = {
          height: `${shape.height}px`,
          width: `${shape.width}px`,
          transform: shape.transform,
        }
        let shapeStyles = {
          height: `${shape.height}px`,
          width: `${shape.width}px`,
          top: `${shape.posY}px`,
          left: `${shape.posX}px`,
          position: 'absolute',
          transform: shape.transform,
          opacity: shape.opacity,
          transition: 'all 1.5s'
        }
        return <div className={thisShapeClass} style={shapeStyles} key={index}><img style={imgStyles} src={getRandomShape()}></img></div>
      }
    )
    
  
    return (
      <div id="shapes-container" className="shapes-container">
        { generatedShapes }
      </div>
    )
}

export default Shapes;