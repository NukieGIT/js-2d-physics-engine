const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.focus();

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const OBJECTS = [];

const USERINPUT = {
    keyboard: {},
    mouse: {
        pos: undefined
    }
}

const wasd = {x: 0, y: 0};

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    
    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    
    mag() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    
    mult(n) {
        return new Vector(this.x * n, this.y * n);
    }
    
    normalize() {
        if (this.mag() === 0) {
            return new Vector(0, 0);
        } else {
            return new Vector(this.x / this.mag(), this.y / this.mag());
        }
    }

    static div(v, n) {
        if (n === 0) {
            return Vector.zero();
        }
        return new Vector(v.x / n, v.y / n);
    }
    
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    
    static cross(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }

    static zero() {
        return new Vector(0, 0);
    }
    
    visualize(startX, startY, n, color="green") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + this.x * n, startY + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

class Object {
    constructor(pos, vel, keyInputForce, mass, friction, angle, angVel, restitution, color="purple") {
        this.pos;
        this.setPos(pos);
        this.vel = vel;
        this.keyInputForce = keyInputForce;
        this.acc = new Vector(0, 0);
        this.mass = 0;
        this.setMass(mass);
        this.friction = friction;
        this.angle = angle;
        this.angVel = angVel;
        this.restitution = restitution;
        this.color = "purple";
        this.setColor(color);
        this.isPlayer = false;
        OBJECTS.push(this);
    }

    input() {
        // if (USERINPUT.keyboard.KeyW) {
        //     this.applyForce(new Vector(0, -this.keyInputForce))
        //     // console.log(this.acc);
        // }
        // if (USERINPUT.keyboard.KeyA) {
        //     this.applyForce(new Vector(-this.keyInputForce, 0))
        //     // console.log(this.acc);
        // }
        // if (USERINPUT.keyboard.KeyS) {
        //     this.applyForce(new Vector(0, this.keyInputForce))
        //     // console.log(this.acc);
        // }
        // if (USERINPUT.keyboard.KeyD) {
        //     this.applyForce(new Vector(this.keyInputForce, 0))
        //     // console.log(this.acc);
        // }

        this.applyForce(new Vector(wasd.x, wasd.y));

        // if (!USERINPUT.keyboard.KeyW && !USERINPUT.keyboard.KeyS) {
        //     this.acc.y = 0;
        // }
        // if (!USERINPUT.keyboard.KeyA && !USERINPUT.keyboard.KeyD) {
        //     this.acc.x = 0;
        // }
    }

    reposition() {
        // this.acc = this.acc.normalize();
        if (this.acc.mag() > 1) {
            this.acc = this.acc.normalize();
        }
        this.acc = this.acc.mult(this.keyInputForce).mult(this.invMass);
        console.log(this.acc.mag());
        this.vel = this.vel.add(this.acc);
        this.pos = this.pos.add(this.vel);
        this.acc = Vector.zero();
    }
    
    applyForce(f) {
        this.acc = this.acc.add(f);
    }
    
    setColor(newC) {
        this.color = newC;
    }

    setMass(newM) {
        this.mass = newM;
        if (this.mass === 0) {
            this.invMass = 0;
        } else {
            this.invMass = 1 / this.mass;
        }
    }

    setPos(newP) {
        this.pos = newP;
    }

    setVel(vel) {
        this.vel = vel;
    }

    setAngle(angle) {
        this.angle = angle;
    }
}

class Ball extends Object{
    constructor(pos, vel, keyInputForce, mass, radius, friction, restitution, color) {
        super(pos, vel, keyInputForce, mass, friction, 0, 0, restitution, color);
        this.radius = radius;
        super.setMass(radius);
    }
    
    render() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineTo(this.pos.x, this.pos.y);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
        ctx.stroke();
    }
}

function userInput() {
    canvas.addEventListener("mousemove", e => {
        USERINPUT.mouse.pos = new Vector(e.clientX, e.clientY);
    })
    canvas.addEventListener("mousedown", e => {
        USERINPUT.mouse[e.button] = true;

    })
    canvas.addEventListener("mouseup", e => {
        USERINPUT.mouse[e.button] = false;
    })

    canvas.addEventListener("keydown", e => {
        USERINPUT.keyboard[e.code] = true;

    })
    canvas.addEventListener("keyup", e => {
        USERINPUT.keyboard[e.code] = false;

    })

    
}

function mainLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    for (let object of OBJECTS) {
        object.render();
        object.input();
        object.reposition();
    }
    
    if (USERINPUT.keyboard.KeyW) {
        wasd.y = -1;
    }
    if (USERINPUT.keyboard.KeyA) {
        wasd.x = -1;
    }
    if (USERINPUT.keyboard.KeyS) {
        wasd.y = 1;
    }
    if (USERINPUT.keyboard.KeyD) {
        wasd.x = 1;
    }
    if (!USERINPUT.keyboard.KeyW && !USERINPUT.keyboard.KeyS) {
        wasd.y = 0;
    }
    if (!USERINPUT.keyboard.KeyA && !USERINPUT.keyboard.KeyD) {
        wasd.x = 0;
    }
    requestAnimationFrame(mainLoop);
}

let ball = new Ball(new Vector(300, 300), new Vector(0, 0), 20, 1, 50, 1, 1, "white");
// let ball2 = new Ball(new Vector(500, 300), new Vector(0, 0), 20, 1, 40, 1, 1, "yellow");

mainLoop();
userInput();