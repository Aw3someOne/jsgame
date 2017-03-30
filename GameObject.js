"use strict"

class GameObject {
    constructor(position = new Vector(), hitboxType = HitBoxType.RED22) {
        this.position = position
        this.hitboxType = hitboxType
    }
    update() {
        throw new Error("GameObject::update not overridden")
    }
    checkCollision() {
        throw new Error("GameObject::checkCollision not overridden")
    }
    addto() {
        //element.appendChild(this.hitbox.image)
        this.redraw()
    }
    getCenter() {
        return new Vector(this.position.x + (hitBoxes[this.hitboxType].width - 1) / 2, this.position.y - (hitBoxes[this.hitboxType].height - 1) / 2)
    }
    redraw(context = enemyBulletContext) {
        context.drawImage(
            bulletSheet,
            hitBoxes[this.hitboxType].x,
            hitBoxes[this.hitboxType].y,
            hitBoxes[this.hitboxType].width,
            hitBoxes[this.hitboxType].height,
            this.position.x,
            this.position.y,
            hitBoxes[this.hitboxType].width,
            hitBoxes[this.hitboxType].height,
        )
        //this.hitbox.image.style.left = this.position.x + "px"
        //this.hitbox.image.style.top = this.position.y + "px"
    }
    checkBounds() {
        if (this.position.x < 0 || this.position.x > WIDTH - hitBoxes[this.hitboxType].width
                || this.position.y < 0 || this.position.y > HEIGHT - hitBoxes[this.hitboxType].height) {
            return false
        }
        return true
    }
}

class Bullet extends GameObject {
    constructor(position = new Vector(), velocity = new Vector(), hitboxType = HitBoxType.RED22) {
        super(position, hitboxType)
        this.velocity = velocity
    }
    update() {
        this.position.x += this.velocity.x * deltaSeconds
        this.position.y += this.velocity.y * deltaSeconds
        this.redraw()
    }
}

class PlayerBullet extends Bullet {
    constructor(position = new Vector(), velocity = new Vector(0, -500), hitboxType = HitBoxType.BLUE12) {
        super(position, velocity, hitboxType)
    }
    checkCollision() {
        var dist = calculateDistance(this.getCenter(), enemy.getCenter())
        if (dist < hitBoxes[this.hitboxType].radius + hitBoxes[enemy.hitboxType].radius) {
            enemy.health--
            console.log("Enemy Health: " + enemy.health)
            return true
        }
        return false
    }
}

class EnemyBullet extends Bullet {
    constructor(position = new Vector(), velocity = new Vector(), hitboxType = HitBoxType.RED22) {
        super(position, velocity, hitboxType)
    }
    checkCollision() {
        var dist = calculateDistance(this.getCenter(), player.getCenter())
        if (dist < hitBoxes[this.hitboxType].radius + hitBoxes[player.hitboxType].radius) {
            clearInterval(mainTimer)
            keys = []
        }
    }
}

class Player extends GameObject {
    constructor(position = new Vector(), hitboxType = HitBoxType.BLUE16) {
        super(position, hitboxType)
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
                enemyBullets = []
                this.currentBombCooldown = this.bombCooldown
                this.bombs--
            }
        }
        moveVector = moveVector.normalize()
        this.position.x += moveVector.x * speed * deltaSeconds
        this.position.y += moveVector.y * speed * deltaSeconds
        this.position.x = Math.max(0, Math.min(WIDTH - hitBoxes[this.hitboxType].width, this.position.x))
        this.position.y = Math.max(0, Math.min(HEIGHT - hitBoxes[this.hitboxType].height, this.position.y))
    }
    fireBullet() {
        var innerleftv = this.position.clone()
        innerleftv.x -= 12
        innerleftv.y += 2

        var innerleft = new PlayerBullet(innerleftv)

        var innerrightv = this.position.clone()
        innerrightv.x += 16
        innerrightv.y += 2
        var innerright = new PlayerBullet(innerrightv)

        var outerleftv = innerleft.position.clone()
        outerleftv.x -= 12
        var outerleft = new PlayerBullet(outerleftv)

        var outerrightv = innerright.position.clone()
        outerrightv.x += 12
        var outerright = new PlayerBullet(outerrightv)

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
    constructor(position = new Vector(), hitboxType = HitBoxType.RED22, health = 1) {
        super(position, hitboxType)
        this.health = health
        this.states = []
        this.currentState
    }
}

class Boss extends Enemy {
    constructor(position = new Vector(), hitboxType = HitBoxType.GREEN62, health = 1000) {
        super(position, hitboxType, health)
        this.states.push(new BossStateZero(this))
        this.states.push(new BossStateOne(this))
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
    constructor(imagesrc = BULLETPNG, objectPosition = new Vector(),  imageDimensions = new Vector(), radius = 0) {
        this.src = imagesrc
        this.x = objectPosition.x
        this.y = objectPosition.y
        this.width = imageDimensions.x
        this.height = imageDimensions.y
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
