function initBroom() {
  broomContainer = document.getElementById('broom');

  // PerspectiveCamera( fov, aspect, near, far )
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 5000);
  camera.position.z = 50;

  // scene
  scene1 = new THREE.Scene();

  // ambient light "globall illuminates all objects in the scene equally" -- no shadows
  // AmbientLight( color, intensity )
  var ambient = new THREE.AmbientLight(0x101030);
  scene1.add(ambient);

  // DirectionalLight( hex, intensity )
  var directionalLight = new THREE.DirectionalLight(0xffeedd);
  directionalLight.position.set(0, 0, 1);
  scene1.add(directionalLight);

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
      scene1.add(obj);

      broom = obj;
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
  renderer.setSize(720, 450);
  broomContainer.appendChild(renderer.domElement);

  //here do hover stuff
  // document.addEventListener('mousemove', onDocumentMouseMove, false);

  //
  window.addEventListener('resize', onWindowResize, false);

}
