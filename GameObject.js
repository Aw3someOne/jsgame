"use strict"

class GameObject {
    constructor(position = new Vector(), hitboxType = HitBoxType.RED22, rotation = 0) {
        this.position = position
        this.hitboxType = hitboxType
        this.rotation = rotation
    }
    update() {
        throw new Error("GameObject::update not overridden")
    }
    checkCollision() {
        throw new Error("GameObject::checkCollision not overridden")
    }
    getVertices() {
        var vertices = []
        for (let i = 0; i < hitBoxes[this.hitboxType].vertices.length; i++) {
            vertices[i] = this.position.add(hitBoxes[this.hitboxType].vertices[i])
        }
        return vertices
    }
    getCenter() {
        return new Vector(this.position.x + (hitBoxes[this.hitboxType].width - 1) / 2, this.position.y - (hitBoxes[this.hitboxType].height - 1) / 2)
    }

    redraw(context = enemyBulletContext) {
        context.save()
        if (this.rotation) {
            context.translate(this.position.x + hitBoxes[this.hitboxType].width / 2,
                this.position.y + hitBoxes[this.hitboxType].height / 2)
            context.rotate(this.rotation)
            context.drawImage(
                bulletSheet,
                hitBoxes[this.hitboxType].x,
                hitBoxes[this.hitboxType].y,
                hitBoxes[this.hitboxType].width,
                hitBoxes[this.hitboxType].height,
                -hitBoxes[this.hitboxType].width / 2,
                -hitBoxes[this.hitboxType].height / 2,
                hitBoxes[this.hitboxType].width,
                hitBoxes[this.hitboxType].height)
            context.restore()
        } else {
            context.drawImage(
                bulletSheet,
                hitBoxes[this.hitboxType].x,
                hitBoxes[this.hitboxType].y,
                hitBoxes[this.hitboxType].width,
                hitBoxes[this.hitboxType].height,
                Math.floor(this.position.x),
                Math.floor(this.position.y),
                hitBoxes[this.hitboxType].width,
                hitBoxes[this.hitboxType].height)
        }
    }
    checkBounds() {
        if (this.position.x < -hitBoxes[this.hitboxType].width || this.position.x > WIDTH
                || this.position.y < -hitBoxes[this.hitboxType].height || this.position.y > HEIGHT) {
            return false
        }
        return true
    }
}

class Bullet extends GameObject {
    constructor(position = new Vector(), velocity = new Vector(), hitboxType = HitBoxType.RED22, rotation = 0) {
        super(position, hitboxType, rotation)
        this.velocity = velocity
    }
    update() {
        this.position.x += this.velocity.x * deltaSeconds
        this.position.y += this.velocity.y * deltaSeconds
        this.redraw()
    }
}

class PlayerBullet extends Bullet {
    constructor(position = new Vector(), velocity = new Vector(0, -1500), hitboxType = HitBoxType.REDKUNAI, rotation = Math.PI) {
        super(position, velocity, hitboxType, rotation)
    }
    checkCollision() {
        var dist = calculateDistance(this.getCenter(), enemy.getCenter())
        if (dist < hitBoxes[this.hitboxType].radius + hitBoxes[enemy.hitboxType].radius) {
            enemy.health--
            return true
        }
        return false
    }
    redraw() {
        super.redraw(playerBulletContext)
    }
}

class EnemyBullet extends Bullet {
    constructor(position = new Vector(), velocity = new Vector(), hitboxType = HitBoxType.RED22, rotation = 0) {
        super(position, velocity, hitboxType, rotation)
    }
    checkCollision() {
        return (collisionTest(this, player))
        /*
        var dist = calculateDistance(this.getCenter(), player.getCenter())
        if (dist < hitBoxes[this.hitboxType].radius + hitBoxes[player.hitboxType].radius) {
            clearInterval(mainTimer)
            keys = []
        }
        */
    }
}

class Player extends GameObject {
    constructor(position = new Vector(), hitboxType = HitBoxType.BLUE12) {
        super(position, hitboxType)
        this.bulletHitBoxType = HitBoxType.REDKUNAI
        this.normalSpeed = 425
        this.slowSpeed = 125
        this.gunCooldown = 50
        this.bombCooldown = 1000
        this.currentGunCooldown = 0
        this.currentBombCooldown = 0
        this.bombs = 3
        this.currentSprite = 0
    }
    redraw(context = playerContext) {
        graphicsContext.drawImage(shipSheet, this.currentSprite++ * 64, 0, 64, 68, this.position.x - 32 + 6, this.position.y - 34 + 6, 64, 68)
        this.currentSprite %= shipCount
        super.redraw(context)
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
        if (keys[c] || autofire) {
            if (this.currentGunCooldown <= 0) {
                this.fireBullet()
                this.currentGunCooldown = this.gunCooldown
            }
        }
        if (keys[b]) {
            if (this.currentBombCooldown <= 0 && this.bombs > 0) {
                var sfx = new Audio(SPELLCARD)
                sfx.play()
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
        var sfx = laserPool.request()
        sfx.play()
        var innerleftv = this.position.clone()
        innerleftv.x -= hitBoxes[this.bulletHitBoxType].width
        innerleftv.y -= 12

        var innerleft = new PlayerBullet(innerleftv, new Vector(0, -1500), this.bulletHitBoxType)

        var innerrightv = this.position.clone()
        innerrightv.x += hitBoxes[this.hitboxType].width
        innerrightv.y -= 12
        var innerright = new PlayerBullet(innerrightv, new Vector(0, -1500), this.bulletHitBoxType)

        var outerleftv = innerleft.position.clone()
        outerleftv.x -= hitBoxes[this.bulletHitBoxType].width
        outerleftv.y += 14
        var outerleft = new PlayerBullet(outerleftv, new Vector(0, -1500), this.bulletHitBoxType)

        var outerrightv = innerright.position.clone()
        outerrightv.x += hitBoxes[this.bulletHitBoxType].width
        outerrightv.y += 14
        var outerright = new PlayerBullet(outerrightv, new Vector(0, -1500), this.bulletHitBoxType)

        playerBullets.push(innerleft)
        playerBullets.push(innerright)
        playerBullets.push(outerleft)
        playerBullets.push(outerright)
    }
}

class Enemy extends GameObject {
    constructor(position = new Vector(), hitboxType = HitBoxType.RED22, health = 1) {
        super(position, hitboxType)
        this.health = health
        this.maxHealth = health
        this.states = []
        this.currentState
    }
}

class Boss extends Enemy {
    constructor(position = new Vector(), hitboxType = HitBoxType.GREEN62, health = 500) {
        super(position, hitboxType, health)
        this.states.push(new BossMultiFlowerState(this))
        this.states.push(new TransitionState(this, 2, new Vector(400 - 31, 30), 300))
        this.states.push(new BossSpiralState(this))
        this.currentState = this.states[0]
        this.statesRemaining = 1
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
    redraw(context = enemyContext) {
        super.redraw(context)
        if (this.health > 0) {
            uiContext.fillStyle = "#FFFF00"
            uiContext.fillRect(100, 10, (WIDTH - 2 * 100) * this.health / this.maxHealth, 10)
            uiContext.beginPath()
            uiContext.rect(100, 10, (WIDTH - 2 * 100) * this.health / this.maxHealth, 10)
            uiContext.font = "30px Arial"
            uiContext.fillText(this.statesRemaining, 50, 30)
            uiContext.stroke()
        }
    }
}

class HitBox {
    constructor(imagesrc = BULLETPNG, objectPosition = new Vector(),  imageDimensions = new Vector(), radius = 0, vertices = null) {
        this.src = imagesrc
        this.x = objectPosition.x
        this.y = objectPosition.y
        this.width = imageDimensions.x
        this.height = imageDimensions.y
        this.radius = radius
        this.vertices = vertices
    }
}
