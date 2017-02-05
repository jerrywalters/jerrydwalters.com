import React, { Component } from 'react';
import React3 from 'react-three-renderer';
import * as THREE from 'three';
import ReactDOM from 'react-dom';

import ParsedModel from '../scripts/parsedModel';
import createMaterial from '../scripts/createMaterial';

class Three extends Component {
  constructor(props, context) {
    super(props, context);

    // construct the position vector here, because if we use 'new' within render,
    // React will think that things have changed when they have not.
    this.cameraPosition = new THREE.Vector3(0, 0, 5);

    this.state = {
      cubeRotation: new THREE.Euler(),
    };

    let parsedModel = new ParsedModel();
    parsedModel.load('../objects/stove.json').then(
      function resolve(m){
        console.log('loaded:', m);
      },
      function reject(e){
        console.error('error:', e);
      }
    );
    
    /*let meshes = [];
    let geometries = this.props.parsedModel.geometries;
    let materialsArray = this.props.parsedModel.materialsArray;
    let materialIndices = this.props.parsedModel.materialIndices;


    geometries.forEach((geometry, uuid) => {
      // get the right material for this geometry using the material index
      let material = materialsArray[materialIndices.get(uuid)];
      // create a react-three-renderer material component
      material = createMaterial(material);

      meshes.push(
        <mesh
          key={uuid}
        >
          <geometry
            vertices={geometry.vertices}
            faces={geometry.faces}
          />
          {material}
        </mesh>
      );
    });*/

    // this._onAnimate = () => {
    //   // we will get this callback every frame

    //   // pretend cubeRotation is immutable.
    //   // this helps with updates and pure rendering.
    //   // React will be sure that the rotation has now updated.
    //   this.setState({
    //     cubeRotation: new THREE.Euler(
    //       this.state.cubeRotation.x + 0.1,
    //       this.state.cubeRotation.y + 0.1,
    //       0
    //     ),
    //   });
    // };
  }

  render() {
    const width = window.innerWidth; // canvas width
    const height = window.innerHeight; // canvas height

    return (<React3
      mainCamera="camera" // this points to the perspectiveCamera which has the name set to "camera" below
      width={width}
      height={height}

      onAnimate={this._onAnimate}
    >
      <scene>
        <perspectiveCamera
          name="camera"
          fov={75}
          aspect={width / height}
          near={0.1}
          far={1000}

          position={this.cameraPosition}
        />

      </scene>
    </React3>);
  }
}

export default Three;