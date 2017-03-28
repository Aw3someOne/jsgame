const DELAY = 10
const WIDTH  = 800
const HEIGHT = 1000

const SHIFT = 16
const SPACE = 32
const LEFT = 37
const UP = 38
const RIGHT = 39
const DOWN = 40

const c = 67

const w = 87
const a = 65
const s = 83
const d = 68

const j = 74

playerprojectiles = []
projectiles = []
timeOfLastUpdate = Date.now()
keys = []
autofire = false

onload = function() {
    maindiv = document.createElement("div")
    maindiv.id = "main"
    maindiv.style.minWidth = WIDTH
    maindiv.style.maxWidth = WIDTH
    maindiv.style.minHeight = HEIGHT
    maindiv.style.maxHeight = HEIGHT
    maindiv.style.backgroundColor = "CCC"
    document.body.appendChild(maindiv)

    normalgamestate = NormalGameState();
    currentstate = normalgamestate

    player = Player(Vector(WIDTH / 2 - 8, HEIGHT - 30))
    player.addto(maindiv)

    boss = Boss(Vector(WIDTH / 2 - 31, 30))
    boss.addto(maindiv)
/*
    for (let i = 0; i < 8; i++) {
        var x = Math.random() * WIDTH
        var y = Math.random() * HEIGHT
        var p = Projectile(Vector(x, y), 15, Vector(100, 200))
        projectiles.push(p)
        p.addto(maindiv)
    }
*/
    gametimer = setInterval(gameLoop, 0)

/*
    setInterval(function(){
        var x = Math.random() * (WIDTH - 200) + 100 // prevent spawning off screen
        var y = Math.random() * (HEIGHT / 2 - 200) + 100
        flower(Vector(x, y), 15, 16, 300, Math.random() * 2 * Math.PI)
    }, 500)
    
    setInterval(async function() {
        var x = Math.random() * (WIDTH - 200) + 100 // prevent spawning off screen
        var y = Math.random() * (HEIGHT / 2 - 200) + 100
        flower(Vector(x, y), 15, 16, 300)
        await sleep(100)
        flower(Vector(x, y), 15, 16, 300, Math.PI / 6)
        await sleep(100)
        flower(Vector(x, y), 15, 16, 300, Math.PI / 3)
    }, 1500)
*/
    var bgm = new Audio("bgm/alien.mp3")
    //bgm.play()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

onkeydown = function(e) {
    keys[e.keyCode] = true
    if (e.keyCode == c) {
        autofire = !autofire
    }
}

onkeyup = function(e) {
    keys[e.keyCode] = false
}

function gameLoop() {
    var time = Date.now()
    delta = time - timeOfLastUpdate
    if (delta < DELAY) { // not enough time has passed
        return
    }

    currentstate.update()

    timeOfLastUpdate = time
}

function NormalGameState() {
    var gs = {}
    gs.update = function() {
        var indx = [] // indices of all projectiles that are out of bounds
        // move all the projectiles
        for (let i = 0; i < projectiles.length; i++) {
            projectiles[i].update()
            if (!projectiles[i].checkbounds()) {
                indx.push(i)
                projectiles[i].remove()
            }
        }
        // delete projectiles that are out of bounds
        for (let i = indx.length - 1; i >= 0; i--) { // delete in reverse order so indices don't break
            projectiles.splice(indx[i], 1)
        }

        indx = []
        for (let i = 0; i < playerprojectiles.length; i++) {
            playerprojectiles[i].update()
            if (!playerprojectiles[i].checkbounds()) {
                indx.push(i)
                playerprojectiles[i].remove()
            }
        }
        for (let i = indx.length - 1; i >= 0; i--) {
            playerprojectiles.splice(indx[i], 1)
        }

        player.update()
        boss.update()
        for (let i = 0; i < projectiles.length; i++) {
            projectiles[i].collideWithPlayer()
        }

        indx = []
        for (let i = 0; i < playerprojectiles.length; i++) {
            playerprojectiles[i].collideWithEnemy()
            if (playerprojectiles[i].collided) {
                indx.push(i)
                playerprojectiles[i].remove()
            }
        }
        for (let i = indx.length - 1; i >= 0; i--) {
            playerprojectiles.splice(indx[i], 1)   
        }
    }
    return gs
}

function Vector(x, y) {
    var v = {}
    v.x = x
    v.y = y
    v.mag = function() {
        return Math.sqrt(v.x * v.x + v.y * v.y)
    }
    v.dir = function() { // seems to work
        return (Math.atan(v.y / v.x) + (v.x < 0 ? Math.PI :
            (v.y < 0 ? 2 * Math.PI : 0)))
    }
    v.clone = function() {
        var c = Vector(v.x, v.y)
        return c
    }
    v.normalize = function() {
        var n = v.clone()
        var m = n.mag()
        if (n.x == 0 && n.y == 0) {
            return n
        }
        n.x /= m
        n.y /= m
        return n
    }
    return v
}

function flower(pos, count, speed, rot = Math.PI / 2) {
    var step = 2 * Math.PI / count
    for (let i = 0; i < count; i++) {
        var angle = step * i + rot
        var v = Vector(speed * Math.cos(angle), speed * Math.sin(angle))
        var p = Projectile1(pos.clone(), Vector(speed * Math.cos(angle), speed * Math.sin(angle)))
        projectiles.push(p)
        p.addto(maindiv)
    }
}

function Player(pos) {
    var p = {}
    p.pos = pos
    p.speed = 275
    p.slow = 125

    p.guncd = 200
    p.currentcd = 0

    p.im = document.createElement("img")
    p.im.src = "img/bullets.png"
    p.im.style.position = "absolute"
    p.im.style.objectFit = "none"

//  D = 16
    p.hbr = 6.5
    p.im.width = 16
    p.im.height = 16
    p.im.style.objectPosition = "-97px -68px"

    p.addto = function(ele) {
        ele.appendChild(p.im)
        p.redraw()
    }
    p.hitcenter = function() {
        return Vector(p.pos.x + (p.im.width - 1) / 2, p.pos.y - (p.im.height - 1) / 2)
    }
    p.update = function() {
        p.currentcd -= delta
        var move = Vector(0, 0)
        var speed = keys[SHIFT] ? p.slow : p.speed // if j is held down, then slow speed
        if (keys[w] || keys[UP]) {
            move.y -= 1
            // console.log("you're holding down 'w'")
        }
        if (keys[a] || keys[LEFT]) {
            move.x -= 1
            // console.log("you're holding down 'a'")
        }
        if (keys[s] || keys.DOWN) {
            move.y += 1
            // console.log("you're holding down 's'")
        }
        if (keys[d] || keys.RIGHT) {
            move.x += 1
            // console.log("you're holding down 'd'")
        }
        if (keys[SPACE] || autofire) {
            if (p.currentcd <= 0) {
                p.fireprojectile()
                p.currentcd = p.guncd
            }
        }
        move = move.normalize() // direction to move
        p.pos.x += move.x * speed * delta / 1000
        p.pos.y += move.y * speed * delta / 1000
        p.pos.x = Math.max(0, Math.min(WIDTH - p.im.width, p.pos.x))
        p.pos.y = Math.max(0, Math.min(HEIGHT - p.im.height, p.pos.y))
        p.redraw()
    }
    p.fireprojectile = function() {
        var v = p.pos.clone()
        v.x += 2
        v.y += 2
        var proj = PlayerProjectile(v)
        playerprojectiles.push(proj)
        proj.addto(maindiv)
    }
    p.redraw = function() {
        p.im.style.left = p.pos.x + "px"
        p.im.style.top = p.pos.y + "px"
    }
    return p
}

function Pattern(owner, cooldown = 500) {
    var p = {}
    p.owner = owner
    p.cooldown = cooldown 
    p.currentcooldown = p.cooldown

    p.create = function() {
        console.log("you forgot to do Patter::create")
    }
    return p
}

function BossStateOnePatternZero(owner) {
    var p = Pattern(owner, 500)
    p.right = true
    p.bulletoffset = (p.owner.im.width - 22) / 2
    p.create = function() {
        flower(Vector(p.owner.pos.x + p.bulletoffset + (p.right ? 100 : -100), p.owner.pos.y + p.bulletoffset), 16, 300, Math.random() * 2 * Math.PI)
        p.right = !p.right
    }
    return p
}

function BossStateOnePatternOne(owner) {
    var p = Pattern(owner, 1500)
    p.bulletoffset = (p.owner.im.width - 22) / 2
    p.create = async function() {
        var angle = Math.random() * 2 * Math.PI
        var v = Vector(p.owner.pos.x + p.bulletoffset, p.owner.pos.y + p.bulletoffset + 30)
        flower(v.clone(), 16, 300, angle)
        await sleep(100)
        flower(v.clone(), 16, 300, angle + Math.PI / 6)
        await sleep(100)
        flower(v.clone(), 16, 300, angle + Math.PI / 3)
    }
    return p
}

function BossStateOne(owner) {
    var s1 = BossState(owner)
    s1.patterns[0] = BossStateOnePatternZero(s1.owner)
    s1.patterns[1] = BossStateOnePatternOne(s1.owner)

    s1.update = async function() {
        for (let i = 0; i < s1.patterns.length; i++) {
            s1.patterns[i].currentcooldown -= delta
            if (s1.patterns[i].currentcooldown <= 0) {
                s1.patterns[i].create()
                s1.patterns[i].currentcooldown = s1.patterns[i].cooldown
            }
        }
    }
    return s1
}

function BossState(owner) {
    var state = {}
    state.owner = owner
    state.patterns = []
    state.update = function() {
        console.log("you forgot to override BossState::update()")
    }
    return state
}

function Boss(pos) {
    var p = {}
    p.pos = pos
    p.health = 300

    p.im = document.createElement("img")
    p.im.src = "img/bullets.png"
    p.im.style.position = "absolute"
    p.im.style.objectFit = "none"
/*
//  D = 30
    p.hbr = 10
    p.im.width = 30
    p.im.height = 30
    p.im.style.objectPosition = "-66px -152px"
*/

//  D = 62
    p.hbr = 24
    p.im.width = 62
    p.im.height = 62
    p.im.style.objectPosition = "-128px -293px"

    p.states = []
    p.states[0] = BossStateOne(p)
    p.currentstate = p.states[0]
    p.addto = function(ele) {
        ele.appendChild(p.im)
        p.redraw()
    }
    p.hitcenter = function() {
        return Vector(p.pos.x + (p.im.width - 1) / 2, p.pos.y - (p.im.height - 1) / 2)
    }
    p.update = function() {
        p.currentstate.update()
        p.redraw()
    }
    p.redraw = function() {
        p.im.style.left = p.pos.x + "px"
        p.im.style.top = p.pos.y + "px"
    }
    return p
}

function PlayerProjectile(pos) {
    var p = Projectile(pos, Vector(0, -500))
    p.im.width = 12
    p.im.height = 12
    p.im.style.objectPosition = "-99px -137px"
    p.hbr = 5
    p.collided = false
    p.collideWithEnemy = function() {
        var dist = calculateDist(p.hitcenter(), boss.hitcenter()) 
        if (dist < p.hbr + boss.hbr) {
            p.collided = true
            boss.health--
            console.log("Boss Health: " + boss.health)
        }
    }
    return p
}

function Projectile1(pos, v) {
    var p = Projectile(pos, v, 9)
    p.im.width = 22
    p.im.height = 22
    p.im.style.objectPosition = "-38px -253px"
    return p
}

function calculateDist(v1, v2) { // calculate difference between to points
    return Math.sqrt(
        Math.pow(v1.x - v2.x ,2) +
        Math.pow(v1.y - v2.y, 2)
    )
}

function Projectile(pos, v, hitboxradius) {
    var p = {}
    p.pos = pos
    p.v = v
    p.hbr = hitboxradius
    p.im = document.createElement("img")
    p.im.src = "img/bullets.png"
    p.im.style.position = "absolute"
    p.im.style.objectFit = "none"

    p.addto = function(ele) {
        ele.appendChild(p.im)
        p.redraw()
    }
    p.remove = function() {
        p.im.remove()
    }
    p.hitcenter = function() {
        return Vector(p.pos.x + (p.im.width - 1) / 2, p.pos.y - (p.im.height - 1) / 2)
    }
    p.update = function() {
        p.pos.x += p.v.x * delta / 1000
        p.pos.y += p.v.y * delta / 1000
        p.redraw()
        // p.collideWithPlayer()
    }
    p.collideWithPlayer = function() {
        var dist = calculateDist(p.hitcenter(), player.hitcenter())
        if (dist < p.hbr + player.hbr) {
            clearInterval(gametimer)
            keys = []
        }
    }
    p.redraw = function() {
        p.im.style.left = p.pos.x + "px"
        p.im.style.top = p.pos.y + "px"
    }
    p.checkbounds = function() {
        if (p.pos.x < 0 || p.pos.x > WIDTH - p.im.width
                || p.pos.y < 0 || p.pos.y > HEIGHT - p.im.height) {
            return false
        }
        return true
    }
    return p
}
