var courageContainer, stoveContainer, broomContainer;
var camera, scene, raycaster, renderer;

// declare objects that exist
var courage;
var sthugh;
var stove;
var broom;
var models = [];

var mouseX = 0, mouseY = 0;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerheight / 2;

init();
animate();

function onWindowResize() {
  windowHalfX = window.innerWidth/2;
  windowHalfY = window.innerHeight/2;

  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function onMouseMove(event) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onClick(event) {
  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects(models, true);
  if (intersects.length > 0) {
    $(".project-single").toggleClass('slideIn');

  }
}

function animate() {
  // from WebGL, this works like setInterval but stops running when you switch tabs!
  requestAnimationFrame(animate);
  // if(window.courageAnimating === true){
  //   courage.rotation.x += 2 * Math.PI / 180;
  //   courage.rotation.y += 2 * Math.PI / 180;
  // }
  // } else if(window.broomAnimating === true) {
  //   broom.rotation.x += 1 * Math.PI / 180;
  //   broom.rotation.y += 3 * Math.PI / 180;
  // } else if(window.stoveAnimating === true) {
  //   stove.rotation.y += 2 * Math.PI / 180;
  // }
  render();
}

function render() {
  // update the picking ray with the camera and mouse position
  	raycaster.setFromCamera( mouse, camera );

  	// calculate objects intersecting the picking ray
  	var intersects = raycaster.intersectObjects(models, true);
    if (intersects.length > 0) {
      console.log('intersecting!');
      // intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
      intersects[ 0 ].object.rotation.y += 2 * Math.PI / 180;
    }
    // this works too but idk why
  	// for ( var i = 0; i < intersects.length; i++ ) {
    //   intersects[i].object.rotation.y += 2 * Math.PI / 180;
  	// }

  // camera.position.x += (mouseX - camera.position.x) * .05;
  // camera.position.y += (mouseY - camera.position.y) * .05;
  //
  // camera.lookAt(scene.position);
  renderer.render(scene, camera);
}

// one day I will learn linear algebra and it will all make sense

window.addEventListener( 'click', onClick, false );
window.addEventListener( 'mousemove', onMouseMove, false );
