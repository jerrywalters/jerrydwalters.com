function init() {
  container = document.getElementById('container');

  // PerspectiveCamera( fov, aspect, near, far )
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 5000);
  camera.position.z = 50;

  // scene
  scene = new THREE.Scene();

  // ambient light "globall illuminates all objects in the scene equally" -- no shadows
  // AmbientLight( color, intensity )
  var ambient = new THREE.AmbientLight(0x99003d);
  scene.add(ambient);

  // DirectionalLight( hex, intensity )
  var directionalLight = new THREE.DirectionalLight(0x99ffda);
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

  // load stove
  loader.load(
    // resource path
    '../objects/stove.obj',
    // pass the loaded data to the onLoad function - assumed to be object
    // do some other shit
    function(obj) {
      obj.traverse(function(child) {
        if(child instanceof THREE.Mesh) {
          child.material.map = texture;
        }
      });
      // add object to scene
      obj.position.y = window.innerHeight/500;
      obj.position.x = window.innerWidth/350;
      obj.position.z = 43;
      obj.rotation.y -= 2 * Math.PI / 180;
      obj.rotation.x += 28 * Math.PI / 180;
      obj.rotation.z -= 12 * Math.PI / 180;

      var bbox = new THREE.BoxHelper( obj, 0x552200 );
      bbox.material.visible = false;

      obj.name = 'stove'
      bbox.name = 'stove'
      bbox.projectName = 'portfolio-admin'
      scene.add(obj);
      scene.add(bbox);
      models.push(obj);
      boxes.push(bbox);

      stove = obj;
    },
    // function called when download progresses
    // in this case defined globally
    onProgress,
    // function called when download error
    // also defined globally
    onError
  );

  // load broom
  loader.load(
    // resource path
    '../objects/broom.obj',
    // pass the loaded data to the onLoad function - assumed to be object
    // do some other shit
    function(obj) {
      obj.traverse(function(child) {
        if(child instanceof THREE.Mesh) {
          child.material.map = texture;
        }
      });
      // add object to scene
      obj.position.y = -2;
      obj.position.x = -1500;
      obj.position.z = -3500;
      models.push(obj);
      scene.add(obj);

      broom = obj;
    },
    // function called when download progresses
    // in this case defined globally
    onProgress,
    // function called when download error
    // also defined globally
    onError
  );

  // load courage
  loader.load(
    // resource path
    '../objects/courage.obj',
    // pass the loaded data to the onLoad function - assumed to be object
    // do some other shit
    function(obj) {
      obj.traverse(function(child) {
        if(child instanceof THREE.Mesh) {
          child.material.map = texture;
        }
      });
      // add object to scene
      obj.position.y = -8;
      obj.position.x = 0;

      var bbox = new THREE.BoxHelper( obj, 0xffff00 );
      bbox.material.visible = false;
      console.log('bbox', bbox);
      obj.name = 'courage'
      bbox.name = 'courage'
      bbox.material.visible = false;
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
