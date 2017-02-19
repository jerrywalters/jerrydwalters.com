import React, { Component } from 'react';
import circleBlue from './shapes/circle-blue.svg';
import circlePurple from './shapes/circle-purple.svg';
import zigzagBlue from './shapes/zigzag-blue.svg';
import zigzagPurple from './shapes/zigzag-purple.svg';
import squiggleBlue from './shapes/squiggle-blue.svg';
import squigglePurple from './shapes/squiggle-purple.svg';
import { generateShapes } from './generateShapes'

let shapes = [];

class Background extends Component {

  componentDidMount() {
    generateShapes(shapes);
  }

  render() {
    const shapeImgs = [circleBlue, zigzagBlue, squiggleBlue, circlePurple, zigzagPurple, squigglePurple];
    let randomShape = shapeImgs[Math.floor(Math.random()*shapeImgs.length)];
    const shapeClasses = [ 'shape1', 'shape2', 'shape3', 'shape4', 'shape5', 'shape6' ];

    function getRandomShape() {
      randomShape = shapeImgs[Math.floor(Math.random()*shapeImgs.length)];
      return randomShape
    }

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
        {shapes.length ? generatedShapes : ''}
      </div>
    )
  }
}
/*const Background = () => {
  const shapeImgs = [circleBlue, zigzagBlue, squiggleBlue, circlePurple, zigzagPurple, squigglePurple];
  let randomShape = shapeImgs[Math.floor(Math.random()*shapeImgs.length)];
  const shapeClasses = [ 'shape1', 'shape2', 'shape3', 'shape4', 'shape5', 'shape6' ];

  function getRandomShape() {
    randomShape = shapeImgs[Math.floor(Math.random()*shapeImgs.length)];
    return randomShape
  }

  generateShapes(shapes);

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
        // background: shape.background,
        opacity: shape.opacity,
        transition: 'all 1.5s'
      }
      return <div className={thisShapeClass} style={shapeStyles} key={index}><img style={imgStyles} src={getRandomShape()}></img></div>
    }
  )


  return (
    <div id="shapes-container" className="shapes-container">
      {generatedShapes}
    </div>
  )
}*/

export default Background;