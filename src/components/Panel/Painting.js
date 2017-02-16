export function initPainting() {

  var canvas = document.getElementById('panel');
  var ctx = canvas.getContext("2d");

  var optionWhite = document.getElementById('options__color--white');
  var optionYellow = document.getElementById('options__color--yellow');
  var optionOrange = document.getElementById('options__color--orange');
  var optionRed = document.getElementById('options__color--red');
  var optionGreen = document.getElementById('options__color--green');
  var optionBlue = document.getElementById('options__color--blue');
  var optionPurple = document.getElementById('options__color--purple');
  var optionBlack = document.getElementById('options__color--black');
  var optionClear = document.getElementById('options__clear');

  // create gradient color
  // gradients are for nephews, I have original ideas too
  // var gradient=ctx.createLinearGradient(0,0,300,0);
  //   gradient.addColorStop("0","magenta");
  //   gradient.addColorStop("0.25","green");
  //   gradient.addColorStop("0.5","blue");
  //   gradient.addColorStop("0.75","yellow");
  //   gradient.addColorStop("1.0","red");

  // create array of colors with associate values for loop to generate listeners
  var colorOptions = [
    {
      el: optionWhite,
      color: 'white',
    },
    {
      el: optionYellow,
      color: 'yellow',
    },
    {
      el: optionOrange,
      color: 'orange',
    },
    {
      el: optionRed,
      color: 'red',
    },
    {
      el: optionGreen,
      color: 'green',
    },
    {
      el: optionBlack,
      color: 'black',
    },
    {
      el: optionBlue,
      color: 'blue',
    },
    {
      el: optionPurple,
      color: 'purple',
    },
  ]

  var optionFive = document.getElementById('options__size--five');
  var optionTen = document.getElementById('options__size--ten');
  var optionTwenty = document.getElementById('options__size--twenty');
  var isMouseDown = false;
  var mouseX;
  var mouseY;
  var rectLeft = canvas.getBoundingClientRect().left;
  var rectTop = canvas.getBoundingClientRect().top;

  optionTen.classList.add('options__size--active');
  optionBlack.classList.add('options__color--active');
  initDrawingLine(ctx);
  initOptions();

  canvas.addEventListener('mousemove', function(e){
    console.log('mousex', mouseX)
    mouseX = e.clientX - 406;
    mouseY = e.clientY - 234;

    console.log('rectleft', rectLeft)
    console.log('mousex', mouseX)
    console.log('recttop', rectTop)
    console.log('mousey', mouseY)

    if(mouseX && isMouseDown){
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
    } else {
      ctx.moveTo(mouseX,mouseY);
    }
  });

  // paint a dot on click
  // canvas.addEventListener('click', function(e){
  //   mouseX = e.clientX - rectLeft;
  //   mouseY = e.clientY - rectTop;

  //   ctx.lineTo(mouseX, mouseY);
  //   ctx.stroke();
  // });


  canvas.addEventListener('mousedown', function(e){
    isMouseDown = true;
  });

  canvas.addEventListener('mouseup', function(e){
    isMouseDown = false;
  });

  function initOptions(){
    colorOptions.forEach(function(colorObj){
      colorObj.el.addEventListener('click', function(){
        removeClassFromElements('.options__color--active');
        this.classList.add('options__color--active');
        setStrokeColor(ctx, colorObj.color);
      });
    })
    optionFive.addEventListener('click', function(){
      removeClassFromElements('.options__size--active');
      this.classList.add('options__size--active');
      setStrokeWidth(ctx, '5');
    });
    optionTen.addEventListener('click', function(){
      removeClassFromElements('.options__size--active');
      this.classList.add('options__size--active');
      setStrokeWidth(ctx, '10');
    });
    optionTwenty.addEventListener('click', function(){
      removeClassFromElements('.options__size--active');
      this.classList.add('options__size--active');
      setStrokeWidth(ctx, '20');
    });
    optionClear.addEventListener('click', function(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      removeClassFromElements('.options__color--active');
      removeClassFromElements('.options__size--active');
      optionTen.classList.add('options__size--active');
      optionBlack.classList.add('options__color--active');
      initDrawingLine(ctx);
    })
  }

};

function initDrawingLine(ctx){
  ctx.beginPath();
  ctx.lineWidth = "10";
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.strokeStyle = "black"; // Green path
}

function setStrokeColor(ctx, color){
  ctx.beginPath();
  ctx.strokeStyle = color;
}

function setStrokeWidth(ctx, size){
  ctx.beginPath();
  ctx.lineWidth = size;
}

function removeClassFromElements(selector){
  var className = selector.startsWith('.') === true ? selector.substr(1) : selector;
  var active = [].slice.call(document.querySelectorAll(selector));
  active.forEach(function(el){
    el.classList.remove(className);
  });
}