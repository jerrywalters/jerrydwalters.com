function init() {
  container = document.getElementById('container');

  // PerspectiveCamera( fov, aspect, near, far )
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 5000);
  camera.position.z = 50;

  // scene
  scene = new THREE.Scene();

  // ambient light "globall illuminates all objects in the scene equally" -- no shadows
  // AmbientLight( color, intensity )
  var ambient = new THREE.AmbientLight(0x000000);
  scene.add(ambient);

  // DirectionalLight( hex, intensity )
  var directionalLight = new THREE.DirectionalLight(0xeeeeee);
  directionalLight.position.set(2, 1.8, 3.5);
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
    if(xhr.lengthComputable) {
      var percentComplete = xhr.loaded/xhr.total*100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  };

  var onError = function(xhr) {

  };

  var loader = new THREE.ImageLoader(manager);
  loader.load(
    '../textures/purple.jpg',
    // function when resource is added
    function(image) {
      // do stuff with it
      texture.image = image;
      texture.needsUpdate = true;
    }
  );
  // model

  var loader = new THREE.OBJLoader(manager);

  // load morty
  loader.load(
    // resource path
    '../objects/morty_small.obj',
    // pass the loaded data to the onLoad function - assumed to be object
    // do some other shit
    function(obj) {
      obj.traverse(function(child) {
        if(child instanceof THREE.Mesh) {
          child.material.color.setHex(0x3c3c3c);
        }
      });
      // add object to scene
      obj.position.y = 1.8;
      obj.position.x = -2.5;
      // obj.position.y = window.innerHeight/60;
      // obj.position.x = window.innerWidth/50;
      obj.position.z = 42;
      obj.rotation.y -= 170 * Math.PI / 180;
      // obj.rotation.x += 180 * Math.PI / 180;
      obj.rotation.z -= 8 * Math.PI / 180;

      var bbox = new THREE.BoxHelper( obj, 0x552200 );
      bbox.material.visible = false;

      obj.name = 'morty';
      bbox.name = 'morty';
      bbox.projectName = 'resume';
      // obj.material.transparent = true;
      // obj.material.opacity = 1;
      scene.add(obj);
      scene.add(bbox);
      models.push(obj);
      boxes.push(bbox);

      morty = obj;
      // setUpTween(stove);
    },
    // function called when download progresses
    onProgress,
    // function called when download error
    onError
  );

  var userOpts	= {
  range		: .035,
  duration	: 2500,
  delay		: 200,
  easing		: 'Elastic.EaseInOut'
};

// function setUpTween(object) {
//   var update = function(){
//     object.position.x = current.x;
//     object.position.y = current.y;
//     console.log('updating!');
//   }
//   // var position = { x : 3, y: 1.2 };
//   // var target = { x: -1, y: -2 };
//   var current	= { x: -userOpts.range, y: -userOpts.range };

//   TWEEN.removeAll();

//   var tweenTo = new TWEEN.Tween(current)
//     .to({x: +userOpts.range, y: +userOpts.range}, 1700)
//     .delay(10)
//     .easing(TWEEN.Easing.Sinusoidal.InOut)
//     .onUpdate(update);

//   var tweenBack = new TWEEN.Tween(current)
//     .to({x: -userOpts.range, y: -userOpts.range}, 1700)
//     .delay(10)
//     .easing(TWEEN.Easing.Sinusoidal.InOut)
//     .onUpdate(update);

//     tweenTo.chain(tweenBack);
//     tweenBack.chain(tweenTo);
//     tweenTo.start();

//   }

  // load praylien
  loader.load(
    // resource path
    '../objects/pray_alien.obj',
    // pass the loaded data to the onLoad function - assumed to be object
    // do some other shit
    function(obj) {
      obj.traverse(function(child) {
        if(child instanceof THREE.Mesh) {
          child.material.color.setHex(0xfb4754);
        }
      });
      // add object to scene
      obj.position.y = 0.1;
      obj.position.x = 0.5;
      obj.position.z = 43;
      obj.rotation.y -= 20 * Math.PI / 180;
      obj.rotation.x += 28 * Math.PI / 180;
      obj.rotation.z -= 12 * Math.PI / 180;


      var bbox = new THREE.BoxHelper( obj, 0xffff00 );
      bbox.material.visible = false;
      console.log('bbox', bbox);
      obj.name = 'praylien'
      bbox.name = 'praylien'

      bbox.projectName = 'portfolio-admin';
      scene.add(obj);
      scene.add(bbox);
      models.push(obj);
      boxes.push(bbox);

      courage = obj;
    },
    // function called when download progresses
    // in this case defined globally
    onProgress,
    // function called when download error
    // also defined globally
    onError
  );

  // load atm
  loader.load(
    // resource path
    '../objects/atm_smallish.obj',
    // pass the loaded data to the onLoad function - assumed to be object
    // do some other shit
    function(obj) {
      obj.traverse(function(child) {
        if(child instanceof THREE.Mesh) {
          child.material.color.setHex(0x00cc66);
        }
      });
      // add object to scene
      obj.position.y = -0.1;
      obj.position.x = 1;
      obj.position.z = 48;
      obj.rotation.y -= -15 * Math.PI / 180;
      obj.rotation.x += 30 * Math.PI / 180;
      obj.rotation.z -= -6 * Math.PI / 180;


      var bbox = new THREE.BoxHelper( obj, 0xffff00 );
      bbox.material.visible = false;
      console.log('bbox', bbox);
      obj.name = 'atm'
      bbox.name = 'atm'

      bbox.projectName = 'capital-one';
      scene.add(obj);
      scene.add(bbox);
      models.push(obj);
      boxes.push(bbox);

      atm = obj;
    },
    // function called when download progresses
    // in this case defined globally
    onProgress,
    // function called when download error
    // also defined globally
    onError
  );

  // load skelly
  loader.load(
    // resource path
    '../objects/skelly_small.obj',
    // pass the loaded data to the onLoad function - assumed to be object
    // do some other shit
    function(obj) {
      obj.traverse(function(child) {
        if(child instanceof THREE.Mesh) {
          child.material.color.setHex(0x4d79ff);
        }
      });
      // add object to scene
      obj.position.y = -1.5;
      obj.position.x = -2.7;
      obj.position.z = 45.5;
      obj.rotation.y -= -40 * Math.PI / 180;
      // obj.rotation.x += 28 * Math.PI / 180;
      // obj.rotation.z -= 12 * Math.PI / 180;


      var bbox = new THREE.BoxHelper( obj, 0xffff00 );
      bbox.material.visible = false;
      console.log('bbox', bbox);
      obj.name = 'skelly'
      bbox.name = 'skelly'

      bbox.projectName = 'portfolio-client';
      scene.add(obj);
      scene.add(bbox);
      models.push(obj);
      boxes.push(bbox);

      skelly = obj;
    },
    // function called when download progresses
    // in this case defined globally
    onProgress,
    // function called when download error
    // also defined globally
    onError
  );

  // load sthugh
  // loader.load(
  //   // resource path
  //   '../objects/sthugh.obj',
  //   // pass the loaded data to the onLoad function - assumed to be object
  //   // do some other shit
  //   function(obj) {
  //     obj.traverse(function(child) {
  //       // if(child instanceof THREE.Mesh) {
  //       //   child.material.map = texture;
  //       // }
  //     });
  //     // add object to scene
  //     obj.position.y = -2;
  //     obj.position.x = 0;
  //     obj.position.z = 40;
  //     models.push(obj);
  //     scene.add(obj);
  //
  //     sthugh = obj;
  //   },
  //   // function called when download progresses
  //   // in this case defined globally
  //   onProgress,
  //   // function called when download error
  //   // also defined globally
  //   onError
  // );

  //
  renderer = new THREE.WebGLRenderer( {alpha:true} );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor (0x000000, 0);
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);

}
