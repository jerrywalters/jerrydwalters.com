import * as THREE from 'three';
import OBJLoader from 'three-obj-loader';
OBJLoader(THREE);

export function loadErUp() {
    var camera, scene, raycaster, renderer;

var container;
var stove;
var models = [];

var mouseX = 0, mouseY = 0;
var mouseX = 0, mouseY = 0;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerheight / 2;

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

// function onClick(event) {
//   raycaster.setFromCamera( mouse, camera );
//   var intersects = raycaster.intersectObjects(models, true);
//   if (intersects.length > 0) {
//     $(".project-single").toggleClass('slideIn');

//   }
// }

function animate() {
    // from WebGL, this works like setInterval but stops running when you switch tabs!
    requestAnimationFrame(animate);
    render();
}

function init() {
    container = document.getElementById('container');

    // PerspectiveCamera( fov, aspect, near, far )
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 5000);
    camera.position.z = 50;

    // scene
    scene = new THREE.Scene();

    // ambient light "globall illuminates all objects in the scene equally" -- no shadows
    // AmbientLight( color, intensity )
    var ambient = new THREE.AmbientLight(0x101030);
    scene.add(ambient);

    // DirectionalLight( hex, intensity )
    var directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    // texture

    // handles and keeps track of loaded and pending data
    var manager = new THREE.LoadingManager();
    manager.onProgress = function(item, loaded, total) {
    console.log(item, loaded, total)
    };

    // Texture( image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy )
    var texture = new THREE.Texture();

    var onProgress = function(xhr) {
    console.log('xhr', xhr)
    if(xhr.lengthComputable) {
        var percentComplete = xhr.loaded/xhr.total*100;
        console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
    };

    var onError = function(xhr) {

    };

    // var loader = new THREE.ImageLoader(manager);
    // loader.load(
    //   '../objects/textures/purple.jpg',
    //   // function when resource is added
    //   function(image) {
    //     // do stuff with it
    //     texture.image = image;
    //     texture.needsUpdate = true;
    //   }
    // );
    // model

    var loader = new THREE.OBJLoader(manager);

    // load stove
    loader.load(
    // resource path
    '../objects/stove.obj',
    // pass the loaded data to the onLoad function - assumed to be object
    // do some other shit
    function(obj) {
        obj.traverse(function(child) {
        if(child instanceof THREE.Mesh) {
        }
        });
        // add object to scene
        obj.position.y = 1.2;
        obj.position.x = 3;
        obj.position.z = 43;
        models.push(obj);
        scene.add(obj);

        stove = obj;
        console.log(models)
    },
    // function called when download progresses
    // in this case defined globally
    onProgress,
    // function called when download error
    // also defined globally
    onError
    );

    //
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor (0x000000, 1);
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
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

    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (mouseY - camera.position.y) * .05;
    
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

init();
animate();
}
window.onload = loadErUp;

