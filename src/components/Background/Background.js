import React from 'react';
import circleBlue from './shapes/circle-blue.svg';
import circlePurple from './shapes/circle-purple.svg';
import zigzagBlue from './shapes/zigzag-blue.svg';
import zigzagPurple from './shapes/zigzag-purple.svg';
import squiggleBlue from './shapes/squiggle-blue.svg';
import squigglePurple from './shapes/squiggle-purple.svg';

const Background = () => {
  const shapeImgs = [circleBlue, zigzagBlue, squiggleBlue];
  let shapes = [];
  let randomShape = shapeImgs[Math.floor(Math.random()*shapeImgs.length)];

  function getRandomShape() {
    randomShape = shapeImgs[Math.floor(Math.random()*shapeImgs.length)];
    return randomShape
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function generateShapes() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    for(let i = 0; i <= 150; i++) {
      let newShape =       
        {
          background: `url(${getRandomShape()}) no-repeat center`,
          height: getRandomInt(6, 30),
          width: getRandomInt(10, 60),
          posX: getRandomInt(1, windowWidth),
          posY: getRandomInt(1, windowHeight),
          transform: `rotate(${getRandomInt(0, 360)}deg)`,
          // color: "#"+((1<<24)*Math.random()|0).toString(16),
          // fucking lol at me being too lazy to just not make another function 
          opacity: `0.${getRandomInt(15, 99)}`
        }
      shapes.push(newShape)
    }
  }

  generateShapes();

  const generatedShapes = shapes.map(
    (shape, index) => {
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
        transformOrigin: 100% 0,
        // background: shape.background,
        opacity: shape.opacity
      }
      return <div style={shapeStyles} key={index}><img style={imgStyles} src={getRandomShape()}></img></div>
    }
  )


  return (
    <div className="shapes-container">
      {generatedShapes}
    </div>
  )
}

export default Background;