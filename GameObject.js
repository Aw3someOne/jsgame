"use strict"

const HitBoxType = {
    RED22 : 0,
    BLUE12: 1,
    BLUE16: 2,
    GREEN62: 3,
}

class GameObject {
    constructor(position = new Vector(), hitboxType = HitBoxType.RED22) {
        this.position = position
        this.hitbox = HitBoxFactory.createHitBox(hitboxType)
    }
    update() {
        throw new Error("GameObject::update not overridden")
    }
    checkCollision() {
        throw new Error("GameObject::checkCollision not overridden")
    }
    addto(element) {
        element.appendChild(this.hitbox.image)
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
    constructor(position = new Vector(), velocity = new Vector(), hitboxType = HitBoxType.RED22) {
        super(position, bitboxType)
        this.velocity = velocity
        this.collided = false
    }
    update() {
        this.position.x += this.velocity.x * deltaSeconds
        this.position.y += this.velocity.y * deltaSeconds
        this.redraw()
    }
}

class PlayerBullet extends Bullet {
    constructor(position = new Vector(), velocity = new Vector(), hitboxType = HitBoxType.BLUE12) {
        super(position, velocity, hitboxType)
    }
    addto(element) {
        super.addto(element)
        playerBullets.push(this)
    }
    checkCollision() {
        var dist = calculateDistance(this.getCenter(), enemy.getCenter())
        if (dist < this.hitbox.radius + enemy.hitbox.radius) {
            this.collided = true
            enemy.health--
            console.log("Enemy Health: " + enemy.health)
        }
    }
}

class EnemyBullet extends Bullet {
    constructor(position = new Vector(), velocity = new Vector(), hitboxType = HitBoxType.RED22) {
        super(position, velocity, hitboxType)
    }
    addto(element) {
        super.addto(element)
        enemyBullets.push(this)
    }
    checkCollision() {
        var dist = calculateDistance(this.getCenter(), enemy.getCenter())
        if (dist < this.hitbox.radius + enemy.hitbox.radius) {
            clearInterval(mainTimer)
            keys = []
        }
    }
}

class Player extends GameObject {
    constructor(position = new Vector(), hitboxType = HitBoxType.BLUE16) {
        super(position, hitboxType)
    }
}

class Enemy extends GameObject {
    constructor(position = new Vector(), hitboxType = HitBoxType.RED22, health = 1) {
        super(position, hitboxType)
        this.health = health
    }
}

class Boss extends Enemy {
    constructor(position = new Vector(), hitboxType = HitBoxType.RED22, health = 1000) {
        super(position, hitboxType, health)
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
        }
    }
}
