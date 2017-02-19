function getRandomInt(min, max) {
min = Math.ceil(min);
max = Math.floor(max);
return Math.floor(Math.random() * (max - min)) + min;
}

export function generateShapes() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    for(let i = 0; i <= 90; i++) {
        let newShape =       
        {
            height: getRandomInt(10, 30),
            width: getRandomInt(20, 60),
            posX: getRandomInt(1, windowWidth),
            posY: getRandomInt(1, windowHeight),
            transform: `rotate(${getRandomInt(0, 360)}deg)`,
            // color: "#"+((1<<24)*Math.random()|0).toString(16),
            // fucking lol at me being too lazy to just not make another function 
            opacity: `0.${getRandomInt(15, 70)}`
        }
        shapes.push(newShape)
    }
}