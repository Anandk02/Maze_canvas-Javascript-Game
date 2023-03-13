const  { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsH = 20;
const cellsV = 20;
const width = window.innerWidth;
const height = window.innerHeight;
console.log(width, height);
const unitLengthX = width / cellsH;
const unitLengthY = width / cellsV;

const engine =  Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;



const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine)   




// create Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, {isStatic: true}),
    Bodies.rectangle(width /2, height, width, 2, {isStatic: true}),
    Bodies.rectangle(0, height / 2, 2, height, {isStatic: true}),
    Bodies.rectangle(width, height / 2, 2, height, {isStatic: true})
]
World.add(world, walls);


// Maze Genration

const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0){
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp  = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
         
    }
    return arr;
}

const grid = Array(cellsV).fill(null).map(() => Array(cellsH).fill(false));

const vertical = Array(cellsV).fill(null).map(() => Array(cellsH - 1).fill(false));

const horizontal = Array(cellsV -1).fill(null).map(() => Array(cellsH).fill(false));

const startRow = Math.floor(Math.random() * cellsV);
const startColoum = Math.floor(Math.random() * cellsH);


const stepThroughCell = (row, column) => {

    // if I have visted the cell at [row, column], then return
    if( grid[row][column]){
        return ;
    }

    //  mark the cell as beging visted
    grid[row][column] = true;


    //  Assembly randomaly -ordered list of neighbors
    const neighbours = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);


    // for each neighbour
    for(let neigbour of neighbours){
        const [nextRow, nextColumn, directoon] = neigbour;
    
    // See if the neigbours is out of bounds
        if(nextRow < 0 || nextRow >= cellsV || nextColumn < 0 || nextColumn >= cellsH ){
            continue;
        }
    
    // if we have visted the neighbours , continue to next neighbour
    if (grid[nextRow][nextColumn]) {
        continue;
    }

    // Remove the walls form either horizantal or verticals 
    if(directoon === 'left'){
        vertical[row][column - 1 ] = true;
    } else if(directoon === 'right'){
        vertical[row][column] = true;
    } else if(directoon === 'up'){
        horizontal[row - 1][column] = true;
    } else if(directoon === 'down'){
        horizontal[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn);

}



    // Visted the next cell
};
stepThroughCell(startRow, startColoum); 


horizontal.forEach((row, rowIndex) => {
    row.forEach((open, coloumIndex) => {
        if(open){
            return;
        }
        const wall  = Bodies.rectangle(
            coloumIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'  
                }
            }
        );
        World.add(world, wall);
    })
})


vertical.forEach((row, rowIndex) =>{
    row.forEach((open, coloumIndex) =>{
        if(open){
            return;
        }

        const wall  = Bodies.rectangle(
            coloumIndex  * unitLengthX + unitLengthX,
            rowIndex * unitLengthY +  unitLengthY / 2,
            5, 
            unitLengthY, 
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'  
                }
            }
        );
        World.add(world, wall);
    })
})



// GOAL
const goal = Bodies.rectangle(

    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7,
    {
        isStatic: true,
        label: 'goal',
        render: {
            fillStyle: 'green'  
        }
    }
);
World.add(world, goal)


// Ball

const ballRadiud = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(

    unitLengthX / 2,
    unitLengthY / 2,
    ballRadiud, 
    {
        label: 'ball',
        render: {
            fillStyle: 'blue'  
        }
    }
);
World.add(world, ball)


// ADDING KEY FUNCTION

document.addEventListener('keydown', event => {

    const {x, y} = ball.velocity;

    if(event.keyCode === 87){
        Body.setVelocity(ball, {x, y: y - 5});
    }

    if(event.keyCode === 68){
        Body.setVelocity(ball, { x: x + 5, y});
    }

    if(event.keyCode === 83){
        Body.setVelocity(ball, { x, y: y + 5});
    }

    if(event.keyCode === 65){
        Body.setVelocity(ball, { x: x - 5, y});
    }
})


// WIN CONDATION

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collection => {
        const labels = ['ball', 'goal'];
        
    if  (
        labels.includes(collection.bodyA.label) && 
        labels.includes(collection.bodyB.label)
        )  {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if(body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            })
        }
    })
})

