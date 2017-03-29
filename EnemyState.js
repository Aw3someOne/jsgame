"use strict"

class Pattern {
    constructor(enemy, cooldown = 500, initialCooldown = 0, hitboxType = HitBoxType.RED22) {
        this.enemy = enemy
        this.cooldown = cooldown
        this.currentCooldown = initialCooldown
        this.hitboxType = hitboxType
        this.freezeCooldown = false
    }
    createPattern() {
        throw new Error("Pattern::createPattern() not overridden")
    }
}

class EnemyState {
    constructor(enemy) {
        this.enemy = enemy
        this.patterns = []
    }
    update() {
        throw new Error("EnemyState::update() not overridden")
    }
}

class SpiralPattern extends Pattern {
    constructor(enemy, cooldown = 1000, initialCooldown = 0, hitboxType = HitBoxType.RED22) {
        super(enemy, cooldown, initialCooldown, hitboxType)
    }
    createPattern() {
        this.freezeCooldown = true
        this.spiral(enemy.position, 90, 200)
    }
    async spiral(position, count, speed, rot = Math.PI / 2) {
        var step = Math.PI / 12
        for (let i = 0; i < count; i++) {
            var angle = step * i + rot
            var v = new Vector(speed * Math.cos(angle), speed * Math.sin(angle))
            var bullet = new EnemyBullet(position.clone(), v.clone(), this.hitboxType)
            bullet.position.x += (enemy.hitbox.image.width - bullet.hitbox.image.width) / 2
            bullet.position.y += (enemy.hitbox.image.height - bullet.hitbox.image.height) / 2
            enemyBullets.push(bullet)
            bullet.addto(mainDiv)
            await sleep(25)
        }
        this.freezeCooldown = false
    }
}

class FlowerPattern extends Pattern {
    constructor(enemy, cooldown = 500, initialCooldown = 0, hitboxType = HitBoxType.RED22) {
        super(enemy, cooldown, initialCooldown, hitboxType)
    }
    createPattern() {
        this.flower(enemy.position, 16, 200)
    }
    flower(position, count, speed, rot = Math.PI / 2) {
        var step = 2 * Math.PI / count
        for (let i = 0; i < count; i++) {
            var angle = step * i + rot
            var v = new Vector(speed * Math.cos(angle), speed * Math.sin(angle))
            var bullet = new EnemyBullet(position.clone(), v.clone(), this.hitboxType)
            bullet.position.x += (enemy.hitbox.image.width - bullet.hitbox.image.width) / 2
            bullet.position.y += (enemy.hitbox.image.height - bullet.hitbox.image.height) / 2
            enemyBullets.push(bullet)
            bullet.addto(mainDiv)
        }
    }
}

class TripleFlowerPattern extends FlowerPattern {
    constructor(enemy, cooldown = 1500, initialCooldown = 0, delay = 100, hitboxType = HitBoxType.RED22) {
        super(enemy, cooldown, initialCooldown, hitboxType)
        this.delay = delay
    }
    async createPattern() {
        this.flower(enemy.position, 16, 100)
        await sleep(this.delay)
        this.flower(enemy.position, 16, 100, Math.PI / 2 + Math.PI / 6)
        await sleep(this.delay)
        this.flower(enemy.position, 16, 100, Math.PI / 2 + Math.PI / 3)
    }
}


class BossStateZero extends EnemyState {
    constructor(enemy) {
        super(enemy)
        this.points = []
        this.points[0] = new Vector(700 - 31, 100)
        this.points[1] = new Vector(400 - 31, 170)
        this.points[2] = new Vector(100 - 31, 100)
        this.points[3] = new Vector(400 - 31, 30)
        this.currentdest = 0
        // this.patterns.push(new FlowerPattern(enemy, 500, 0, HitBoxType.RED22 ))
        this.patterns.push(new TripleFlowerPattern(enemy, 1500, 0, 100, HitBoxType.CYAN22))
        // this.patterns.push(new SpiralPattern(enemy))
    }
    update() {
        for (let i = 0; i < this.patterns.length; i++) {
            if (!this.patterns[i].freezeCooldown) {
                this.patterns[i].currentCooldown -= deltaTime
            }
            if (this.patterns[i].currentCooldown <= 0) {
                this.patterns[i].createPattern()
                this.patterns[i].currentCooldown = this.patterns[i].cooldown
            }
        }
        if (enemy.moveTowards(this.points[this.currentdest], 75)) {
            this.currentdest = ++this.currentdest % this.points.length
        }
    }
}
