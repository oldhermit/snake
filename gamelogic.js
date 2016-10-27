
//Напрямки руху. Можливо, колись додатуться розширення швидко/повільно ліворуч/праворуч
const [LEFT, RIGHT, FORWARD] = [0, 1, 2];

const
    PI = Math.PI,
    PRECISION = 1, // К-ть знаків після коми у шляхах SVG
    TICK_INTERVAL = 50, //ms
    TURN_RADIUS = 30,
    VELOCITY = 3,
    ANGULAR_VELOCITY = VELOCITY/TURN_RADIUS,
    GROWTH = 10, // Приріст довжини в тіках від одного проковтнутого зайця
    START_LENGTH = 20, // Початкова довжина гадюки в тіках
    MUST_GROWTH = 80, // На скільки тіків змія може вирости на початку гри
    START_ANGLE = 0.5, // Початковий кут, куди повзе змія
    START_X = 250, //Початкові координати хвоста гадюки
    START_Y = 175;


const [SHIFT_KEY, CTRL_KEY, ALT_KEY, LEFT_KEY,
    UP_KEY, RIGHT_KEY, DOWN_KEY] = [16,17,18,37,38,39,40];

class LineSegment {
    constructor(x0, y0, angle) {
        this.x0 = x0;
        this.y0 = y0;
        this.angle = angle;
        this.ticks = 0;
    }
    getAngle () {
        return this.angle;
    }
    // формує шлях для елемента SVG "path"
    drawPath(){
        this.path = 'L'+this.x0.toFixed(PRECISION)+','+this.y0.toFixed(PRECISION);
    }
    nextTick () {
        this.ticks += 1;
        let len = VELOCITY * this.ticks;
        this.xN = this.x0 + len * Math.cos(this.angle);
        this.yN = this.y0 - len * Math.sin(this.angle);
        this.drawPath();
    }

    cutTail () {
        this.ticks -= 1;
        let len = VELOCITY * this.ticks;
        this.x0 = this.xN - len * Math.cos(this.angle);
        this.y0 = this.yN + len * Math.sin(this.angle);
        this.drawPath();
        return this.ticks;
    }
}

class ArcSegment {
    constructor(x0, y0, angle, direction) {
        let where = direction ? angle - PI/2 : angle + PI/2;
        this.x0 = x0;
        this.y0 = y0;
        this.angle0 = where - PI;
        if (this.angle0<0) this.angle0 += 2*PI;
        this.direction = direction;
        this.ox = x0 + TURN_RADIUS * Math.cos(where);
        this.oy = y0 - TURN_RADIUS * Math.sin(where);
        this.ticks = 0;
        this.velocity = direction ? -ANGULAR_VELOCITY : ANGULAR_VELOCITY;
    }
    getAngle () {
        console.log(this.angleN + (this.direction ? -PI/2 : PI/2));
        return this.angleN + (this.direction ? -PI/2 : PI/2);
    }
    // формує шлях для елемента SVG "path"
    drawPath(){
        this.path = `A${TURN_RADIUS},${TURN_RADIUS},0,`;
        this.path += Math.abs(this.angleN-this.angle0)>PI ? '1,' : '0,';
        this.path += 1-this.direction + ',' +
            this.x0.toFixed(PRECISION)+','+
            this.y0.toFixed(PRECISION);
    }
    nextTick () {
        this.ticks += 1;
        this.angleN = this.angle0 + this.velocity * this.ticks;
        this.xN = this.ox + TURN_RADIUS * Math.cos(this.angleN);
        this.yN = this.oy - TURN_RADIUS * Math.sin(this.angleN);
        this.drawPath();
    }
    cutTail () {
        this.ticks -= 1;
        this.angle0 = this.angleN - this.velocity * this.ticks;
        this.x0 = this.ox + TURN_RADIUS * Math.cos(this.angle0);
        this.y0 = this.oy - TURN_RADIUS * Math.sin(this.angle0);
        this.drawPath();
        return this.ticks;
    }
}

class Snake {
    constructor () {
        this.direction = FORWARD;
        this.growth = MUST_GROWTH,
        this.segs = [new LineSegment(START_X, START_Y, START_ANGLE)];
        this.segs[0].ticks = START_LENGTH - 1;
        this.nextTick(FORWARD);
    }

    _changeDirection (direction) {
        this.direction = direction;
        let s = this.segs[0];
        if (s.ticks == 0) {
            this.segs.shift();
            s = this.segs[0];
        }
        if (direction==FORWARD) {
            this.segs.unshift(new LineSegment(s.xN, s.yN, s.getAngle()));
        } else {
            this.segs.unshift(new ArcSegment(s.xN, s.yN, s.getAngle(), direction));
        }
    }

    nextTick (direction) {
        if (direction!=this.direction) { this._changeDirection(direction); }
        this.segs[0].nextTick();
        if (this.growth) {
            this.growth--;
        } else {
            let lastseg = this.segs.pop();
            if (lastseg.cutTail()) {
                this.segs.push(lastseg);
            }
        }
    }

    getPath () { //Повертає параметр "d" для SVG-path
        let path0 = `M${this.segs[0].xN.toFixed(PRECISION)},${this.segs[0].yN.toFixed(PRECISION)} `;
        return this.segs.reduce((prev, seg)=> prev+seg.path, path0);
    }
}

let snake = new Snake();

/*
* KEYBOARD MODULE
* *********************************************************************/

var currentDirection = FORWARD;

let leftKeyDown = false;
let rightKeyDown = false;

function calcDirection() {
    if (leftKeyDown) {
        currentDirection = LEFT;
    } else if (rightKeyDown) {
        currentDirection = RIGHT;
    } else {
        currentDirection = FORWARD;
    }
}

function keyDownHandler(event) {
    var keyCode = event.keyCode;
    if(keyCode==LEFT_KEY) {
        leftKeyDown = true;
        calcDirection();
    } else if (keyCode==RIGHT_KEY) {
        rightKeyDown = true;
        calcDirection();
    }
}

function keyUpHandler(event) {
    var keyCode = event.keyCode;
    if(keyCode==LEFT_KEY) {
        leftKeyDown = false;
        calcDirection();
    } else if (keyCode==RIGHT_KEY) {
        rightKeyDown = false;
        calcDirection();
    }
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

/* ****************************************
  END OF KEYBOARD MODULE
 */

snakeBody = document.getElementById('snakebody');

setInterval(() => {
    snake.nextTick(currentDirection);
    snakeBody.setAttribute('d', snake.getPath());
}, TICK_INTERVAL);
