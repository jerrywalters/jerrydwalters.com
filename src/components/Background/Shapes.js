import React from 'react';
// import face from './shapes/face.svg';
import sock from './shapes/sock.svg';
import glove from './shapes/glove.svg';
import hat from './shapes/hat.svg';
import belt from './shapes/belt.svg';

const Shapes = () => {
    let shapes = [];
    const shapeImgs = [hat, sock, glove, belt];
    let randomShape = shapeImgs[Math.floor(Math.random()*shapeImgs.length)];
    const shapeClasses = [ 'shape1', 'shape2', 'shape3', 'shape4'];

    function getRandomShape() {
      randomShape = shapeImgs[Math.floor(Math.random()*shapeImgs.length)];
      return randomShape
    }

    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function setNumIterations(windowWidth) {
      var numIterations;
      // if the expression evaluates to true, generate this number of shapes in the background
      switch(true) {
        case windowWidth > 1920: 
          return numIterations = 130
        case windowWidth > 1440:
          return numIterations = 100
          // break;
        case windowWidth > 1110:
          return numIterations = 80
          // break;
        case windowWidth > 800:
          return numIterations = 60
          // break;
        case windowWidth < 800:
          return numIterations = 40
          // break;
        default:
          return numIterations = 60
      }
    }

    function generateShapes() {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      let numI = setNumIterations(windowWidth);

      for(let i = 0; i <= numI; i++) {
        let newShape =       
        {
            height: getRandomInt(30, 70),
            width: getRandomInt(30, 70),
            posX: getRandomInt(1, windowWidth),
            posY: getRandomInt(1, windowHeight),
            transform: `rotate(${getRandomInt(0, 360)}deg)`,
            // fucking lol at me being too lazy to just not make another function 
            opacity: `0.${getRandomInt(25, 70)}`
        }
        shapes.push(newShape)
      }
    }

    generateShapes();
    window.addEventListener('resize', function () {
      generateShapes();
    }, false);

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