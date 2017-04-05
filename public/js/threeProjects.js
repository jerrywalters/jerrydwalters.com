var camera, scene, raycaster, renderer;

// React
// define some dirty action right here in public
const OPEN_PROJECT = 'OPEN_PROJECT';

function openProject(projectName) {
  window.browserHistory.push(`/project/${projectName}`)
  let projects = window.projects;
  return {
    type: OPEN_PROJECT,
    project: projects[projects.findIndex(project => project.name === projectName)]
  }
}

// found a better way!
//  const adminImg = document.getElementsByClassName('bg-img__stove');
//  const capImg = document.getElementsByClassName('bg-img__atm');
//  const portfolioImg = document.getElementsByClassName('bg-img__skelly');

//  portfolioImg[0].addEventListener("click", () => (openProject('portfolio-client')))
//  adminImg[0].addEventListener("click", () => (openProject('portfolio-admin')))
//  capImg[0].addEventListener("click", () => (openProject('capital-one')))

// on click dispatch said dirty action and update my state
function onClick(event) {
  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects(boxes, true); 
  if (intersects.length > 0) {
    const projectName = intersects[0].object.projectName;
    window.store.dispatch(openProject(projectName));
  } 
}

// Three
// declare objects that exist
var morty;
var skelly;
var atm;
var praylien;
var models = [];
var boxes = [];

var mouseX = 0, mouseY = 0;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerheight / 2;

window.onload = function(){
  init();
  animate();
}

function onWindowResize() {
  windowHalfX = window.innerWidth/2;
  windowHalfY = window.innerHeight/2;

  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // responsive models
  // morty.position.y = window.innerHeight/360;
  // morty.position.x = window.innerWidth/-510;

  // atm.position.y = window.innerHeight/-6000;
  // atm.position.x = window.innerWidth/1200;
  if(window.innerWidth < 700) {
    // skelly.position.y = -1000;
    // atm.position.y = -1000;
    // praylien.position.y = -1000;
  }
  atm.position.x = window.innerWidth/1372;

  // skelly.position.y = window.innerHeight/-425;
  skelly.position.x = window.innerWidth/-490;
  skelly.position.x = window.innerWidth/-580;

  }


function onMouseMove(event) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function animate() {
  // from WebGL, this works like setInterval but stops running when you switch tabs!
  requestAnimationFrame(animate);
  // TWEEN.update();
  if(window.innerWidth > 700) {
    render();
  }
}

function render() {
  // update the picking ray with the camera and mouse position
  	raycaster.setFromCamera( mouse, camera );

  	// calculate objects intersecting the picking ray

    // reset cursor to default if not hovering
    document.body.style.cursor = "default";

  	var intersects = raycaster.intersectObjects(boxes, true);
    if (intersects.length > 0) {
      let boxName = intersects[0].object.name;
      // if i'm hovering over an object set cursor to pointer (raycasting ugh)
      document.body.style.cursor = "pointer";
      let modelIndex = models.findIndex(function(model) {
        return model.name === boxName;
      });
      let intersectedObject = models[modelIndex];
      // intersects.position = intersectedObject.position;
      intersectedObject.rotation.y += 2 * Math.PI / 180; 
    }
  renderer.render(scene, camera);
}

window.addEventListener( 'click', onClick, false );
window.addEventListener( 'mousemove', onMouseMove, false );
