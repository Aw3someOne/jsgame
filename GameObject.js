"use strict"

class GameObject {
    constructor(position = new Vector()) {
        this.position = position
        this.hitbox
    }
    update() {
        throw new Error("GameObject::update not overridden")
    }
    checkCollision() {
        throw new Error("GameObject::checkCollision not overridden")
    }
    setHitBox(hitbox) {
        this.hitbox = hitbox
    }
    addto(element) {
        element.appendChild(this.hitbox.image)
        this.redraw()
    }
    remove() {
        this.hitbox.image.remove()
    }
    getCenter() {
        return new Vector(this.position.x + (this.hitbox.image.width - 1) / 2, this.position.y - (this.hitbox.image.height - 1) / 2)
    }
    redraw() {
        this.hitbox.image.style.left = this.position.x + "px"
        this.hitbox.image.style.top = this.position.y + "px"
    }
    checkBounds() {
        if (this.position.x < 0 || this.position.x > WIDTH - this.hitbox.image.width
                || this.position.y < 0 || this.position.y > HEIGHT - this.hitbox.image.height) {
            return false
        }
        return true
    }
}

class Bullet extends GameObject {
    constructor(position = new Vector(), velocity = new Vector()) {
        super(position)
        this.velocity = velocity
    }
    update() {
        this.position.x += this.velocity.x * deltaSeconds
        this.position.y += this.velocity.y * deltaSeconds
        this.redraw()
    }
}

class PlayerBullet extends Bullet {
    constructor(position = new Vector(), velocity = new Vector(0, -500)) {
        super(position, velocity)
    }
    addto(element) {
        super.addto(element)
        playerBullets.push(this)
    }
    checkCollision() {
        var dist = calculateDistance(this.getCenter(), enemy.getCenter())
        if (dist < this.hitbox.radius + enemy.hitbox.radius) {
            enemy.health--
            console.log("Enemy Health: " + enemy.health)
            return true
        }
        return false
    }
}

class EnemyBullet extends Bullet {
    constructor(position = new Vector(), velocity = new Vector()) {
        super(position, velocity)
    }
    addto(element) {
        super.addto(element)
        enemyBullets.push(this)
    }
    checkCollision() {
        var dist = calculateDistance(this.getCenter(), player.getCenter())
        if (dist < this.hitbox.radius + player.hitbox.radius) {
            clearInterval(mainTimer)
            keys = []
        }
    }
}

class Player extends GameObject {
    constructor(position = new Vector()) {
        super(position)
        this.normalSpeed = 275
        this.slowSpeed = 125
        this.gunCooldown = 200
        this.bombCooldown = 1000
        this.currentGunCooldown = 0
        this.currentBombCooldown = 0
        this.bombs = 3
    }
    update() {
        this.currentGunCooldown -= deltaTime
        this.currentBombCooldown -= deltaTime
        var moveVector = new Vector()
        var speed = keys[SHIFT] ? this.slowSpeed : this.normalSpeed // if shift is held down, then slow speed
        if (keys[w] || keys[UP]) {
            moveVector.y -= 1
            // console.log("you're holding down 'w'")
        }
        if (keys[a] || keys[LEFT]) {
            moveVector.x -= 1
            // console.log("you're holding down 'a'")
        }
        if (keys[s] || keys[DOWN]) {
            moveVector.y += 1
            // console.log("you're holding down 's'")
        }
        if (keys[d] || keys[RIGHT]) {
            moveVector.x += 1
            // console.log("you're holding down 'd'")
        }
        if (keys[SPACE] || autofire) {
            if (this.currentGunCooldown <= 0) {
                this.fireBullet()
                this.currentGunCooldown = this.gunCooldown
            }
        }
        if (keys[b]) {
            if (this.currentBombCooldown <= 0 && this.bombs > 0) {
                for (let i = 0; i < enemyBullets.length; i++) {
                    enemyBullets[i].remove()
                }
                enemyBullets = []
                this.currentBombCooldown = this.bombCooldown
                this.bombs--
            }
        }
        moveVector = moveVector.normalize()
        this.position.x += moveVector.x * speed * deltaSeconds
        this.position.y += moveVector.y * speed * deltaSeconds
        this.position.x = Math.max(0, Math.min(WIDTH - this.hitbox.image.width, this.position.x))
        this.position.y = Math.max(0, Math.min(HEIGHT - this.hitbox.image.height, this.position.y))
    }
    fireBullet() {
        var innerleftv = this.position.clone()
        innerleftv.x -= 12
        innerleftv.y += 2

        var innerleft = new PlayerBullet(innerleftv)
        innerleft.setHitBox(HitBoxFactory.createHitBox(HitBoxType.BLUE12))

        var innerrightv = this.position.clone()
        innerrightv.x += 12
        innerrightv.y += 2
        var innerright = new PlayerBullet(innerrightv)
        innerright.setHitBox(HitBoxFactory.createHitBox(HitBoxType.BLUE12))

        var outerleftv = innerleft.position.clone()
        outerleftv.x -= 12
        var outerleft = new PlayerBullet(outerleftv)
        outerleft.setHitBox(HitBoxFactory.createHitBox(HitBoxType.BLUE12))

        var outerrightv = innerright.position.clone()
        outerrightv.x += 12
        var outerright = new PlayerBullet(outerrightv)
        outerright.setHitBox(HitBoxFactory.createHitBox(HitBoxType.BLUE12))

        playerBullets.push(innerleft)
        innerleft.addto(mainDiv)

        playerBullets.push(innerright)
        innerright.addto(mainDiv)

        playerBullets.push(outerleft)
        outerleft.addto(mainDiv)

        playerBullets.push(outerright)
        outerright.addto(mainDiv)
    }
}

class Enemy extends GameObject {
    constructor(position = new Vector(), health = 1) {
        super(position)
        this.health = health
        this.states = []
        this.currentState
    }
}

class Boss extends Enemy {
    constructor(position = new Vector(), health = 1000) {
        super(position, health)
        this.states[0] = new BossStateZero(this)
        this.currentState = this.states[0]
    }
    moveTowards(destination, speed) {
        if (calculateDistance(destination, this.position) <= speed * deltaSeconds) {
            this.position.x = destination.x
            this.position.y = destination.y
            return true
        }
        var direction = new Vector(destination.x - this.position.x, destination.y - this.position.y)
        var normal = direction.normalize()
        this.position.x += normal.x * speed * deltaSeconds
        this.position.y += normal.y * speed * deltaSeconds
        return false
    }
    update() {
        this.currentState.update()
    }
}

class HitBox {
    constructor(imagesrc = BULLETPNG, objectPosition = "",  imageDimensions = new Vector(), radius = 0) {
        this.image = document.createElement("img")
        this.image.src = imagesrc
        this.image.style.position = "absolute"
        this.image.style.objectFit = "none"
        this.image.style.objectPosition = objectPosition
        this.image.width = imageDimensions.x
        this.image.height = imageDimensions.y
        this.radius = radius
    }
}

const HitBoxType = {
    BLUE12:     0,
    BLUE16:     1,
    RED22:      22,
    PURPLE22:   23,
    BLUE22:     24,
    CYAN22:     25,
    GREEN22:    26,
    YELLOW22:   27,
    GREEN62:    62,
}

class HitBoxFactory {
    constructor() {}
    static createHitBox(hitboxType = HitBoxType.RED22) {
        switch (hitboxType) {
        case HitBoxType.RED22:
            return new HitBox(BULLETPNG, "-38px -253px", new Vector(22, 22), 9)
        case HitBoxType.BLUE12:
            return new HitBox(BULLETPNG, "-99px -137px", new Vector(12, 12), 5)
        case HitBoxType.BLUE16:
            return new HitBox(BULLETPNG, "-97px -68px", new Vector(16, 16), 6.5)
        case HitBoxType.GREEN62:
            return new HitBox(BULLETPNG, "-128px -293px", new Vector(62, 62), 31)
        case HitBoxType.PURPLE22:
            return new HitBox(BULLETPNG, "-70px -253px", new Vector(22, 22), 9)
        case HitBoxType.BLUE22:
            return new HitBox(BULLETPNG, "-102px -253px", new Vector(22, 22), 9)
        case HitBoxType.CYAN22:
            return new HitBox(BULLETPNG, "-134px -253px", new Vector(22, 22), 9)
        case HitBoxType.GREEN22:
            return new HitBox(BULLETPNG, "-166px -253px", new Vector(22, 22), 9)
        case HitBoxType.YELLOW22:
            return new HitBox(BULLETPNG, "-198px -253px", new Vector(22, 22), 9)

        }
    }
}
