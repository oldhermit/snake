/**
 * Created by Volodymyr on 26.10.2016.
 */
const
    PI = Math.PI,
    PRECISION = 4, // К-ть знаків після коми у шляхах SVG
    TICK = 200, //ms
    TURN_RADIUS = 10,
    VELOCITY = 1,
    ANGULAR_VELOCITY = VELOCITY/2/PI/TURN_RADIUS,
    GROWTH = 10, // Приріст довжини в тіках від одного проковтнутого зайця
    START_LENGTH = 20, // Початкова довжина гадюки в тіках
    START_DIRECTION = 0, // Початковий кут, куди повзе змія
    START_X = 50, //Початкові координати хвоста гадюки
    START_Y = 50;

//Напрямки руху. Можливо, колись додатуться розширення швидко/повільно ліворуч/праворуч
const [LEFT, RIGHT, FORWARD] = [0, 1, 2];

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
        this.xN = this.x0 + len * Math.sin(this.angle);
        this.yN = this.y0 + len * Math.cos(this.angle);
        this.drawPath();
    }
}

class ArcSegment {
    consturctor(x0, y0, angle, direction) {
        this.x0 = x0;
        this.y0 = y0;
        this.angle0 = direction ? angle - PI/2 : angle + PI/2;
        this.direction = direction;
        this.ox = x0 + TURN_RADIUS * Math.sin(this.angle0 + PI);
        this.oy = y0 + TURN_RADIUS * Math.cos(this.angle0 + PI);
        this.ticks = 0;
    }
    getAngle () {
        return this.angleN + this.direction ? PI/2 : -PI/2;
    }
    // формує шлях для елемента SVG "path"
    drawPath(){
        this.path = `A{TURN_RADIUS},{TURN_RADIUS},0,`
        this.path += Math.abs(this.angleN-this.angle0)>PI ? '1,' : '0,';
        this.path += 1-this.direction + ',' +
            this.x0.toFixed(PRECISION)+','+
            this.y0.toFixed(PRECISION);
    }
    nextTick () {
        this.ticks += 1;
        this.angleN = this.angle0 + ANGULAR_VELOCICTY * this.ticks;
        this.xN = ox + TURN_RADIUS * Math.sin(this.angleN);
        this.yN = oy + TURN_RADIUS * Math.cos(this.angleN);
        this.drawPath();
    }
}

let snake = {
    setDirection: direction => {
        if (direction == this.direction) { return; }
        //Написати тут додавння нового сегмента гадюки
    },
    nextTick: function () {
        this.segs[0].nextTick();
    },
    direction: START_DIRECTION,
    growth: 0, //Залишишося ще підрости
    segs: [new LineSegment(START_X, START_X, START_DIRECTION)]
};

console.log(snake.segs[0]);
snake.segs[0].ticks = START_LENGTH - 1;
snake.nextTick();

console.log(snake);