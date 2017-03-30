"use strict"

class Pattern {
    constructor(enemy, cooldown = 500, initialCooldown = 0, hitboxType = HitBoxType.RED22) {
        this.enemy = enemy
        this.cooldown = cooldown
        this.currentCooldown = initialCooldown
        this.hitboxType = hitboxType
        this.freezeCooldown = false
        this.hitboxType = hitboxType
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
    constructor(enemy, cooldown = 1000, initialCooldown = 0, hitboxType = HitBoxType.RED22, stepAngle = Math.PI / 12) {
        super(enemy, cooldown, initialCooldown, hitboxType)
        this.step = stepAngle
    }
    createPattern() {
        this.freezeCooldown = true
        this.spiral(enemy.position, 90, 200)
    }
    async spiral(position, count, speed, rot = Math.PI / 2) {
        for (let i = 0; i < count; i++) {
            var angle = this.step * i + rot
            var v = new Vector(speed * Math.cos(angle), speed * Math.sin(angle))
            var bullet = new EnemyBullet(position.clone(), v.clone(), this.hitboxType)
            bullet.position.x += (hitBoxes[enemy.hitboxType].width - hitBoxes[bullet.hitboxType].width) / 2
            bullet.position.y += (hitBoxes[enemy.hitboxType].height - hitBoxes[bullet.hitboxType].height) / 2
            enemyBullets.push(bullet)
            bullet.addto(mainDiv)
            await sleep(25)
        }
        this.freezeCooldown = false
    }
}

class FlowerPattern extends Pattern {
    constructor(enemy, cooldown = 500, initialCooldown = 0, hitboxType = HitBoxType.RED22, count = 16, speed = 200, rot = Math.PI / 2) {
        super(enemy, cooldown, initialCooldown, hitboxType)
        console.log(this.hitboxType)
        this.vectors = []
        this.count = count
        this.speed = speed
        this.rot = rot
        this.step = 2 * Math.PI / count
        for (let i = 0; i < count; i++) {
            var angle = this.step * i + rot
            this.vectors[i] = new Vector(speed * Math.cos(angle), speed * Math.sin(angle))
        }
    }
    createPattern() {
        this.flower(enemy.position, this.count, this.speed, this.rot)
    }
    flower(position, count, speed, rot = Math.PI / 2) {
        for (let i = 0; i < count; i++) {
            var bullet = new EnemyBullet(new Vector(position.x + (hitBoxes[enemy.hitboxType].width - hitBoxes[this.hitboxType].width) / 2,
                position.y + (hitBoxes[enemy.hitboxType].height - hitBoxes[this.hitboxType].height) / 2), this.vectors[i], this.hitboxType)
            enemyBullets.push(bullet)
            bullet.addto(mainDiv)
        }
    }
}


class TripleFlowerPattern extends FlowerPattern {
    constructor(enemy, cooldown = 500, initialCooldown = 0, hitboxType = HitBoxType.RED22, count = 16, speed = 200, rot = Math.PI / 2) {
        super(enemy, cooldown, initialCooldown, hitboxType, count, speed, rot)
    }
    async createPattern() {
        var v = enemy.position.clone()
        this.flower(v, this.count, this.speed, this.rot)
        await sleep(200)
        this.flower(v, this.count, this.speed, this.rot)
        await sleep(200)
        this.flower(v, this.count, this.speed, this.rot)
    }
}


class BossStateZero extends EnemyState {
    constructor(enemy) {
        super(enemy)
        this.points = []
        this.points.push(new Vector(700 - 31, 100))
        this.points.push(new Vector(400 - 31, 170))
        this.points.push(new Vector(100 - 31, 100))
        this.points.push(new Vector(400 - 31, 30))
        this.currentdest = 0
        //this.patterns.push(new TripleFlowerPattern(enemy, 3000, 0, HitBoxType.GREEN22, 16, 300, Math.PI / 2))
        this.patterns.push(new FlowerPattern(enemy, 3000, 0, HitBoxType.GREEN22, 32, 75, Math.PI / 2))
        this.patterns.push(new FlowerPattern(enemy, 3000, 300, HitBoxType.CYAN22, 32, 75, 2 * Math.PI / 3))
        this.patterns.push(new FlowerPattern(enemy, 3000, 600, HitBoxType.RED22, 32, 75, 5 * Math.PI / 6))
        this.patterns.push(new SpiralPattern(enemy, 1000, 0, HitBoxType.YELLOW22))
        this.patterns.push(new SpiralPattern(enemy, 1000, 500, HitBoxType.PURPLE22))
    }
    update() {
        if (enemy.health <= 975) {
            enemy.currentState = enemy.states[1]
            console.log("moving to next stage")
        }
        for (let i = 0; i < this.patterns.length; i++) {
            if (!this.patterns[i].freezeCooldown) {
                this.patterns[i].currentCooldown -= deltaTime
            }
            if (this.patterns[i].currentCooldown <= 0) {
                this.patterns[i].createPattern()
                this.patterns[i].currentCooldown += this.patterns[i].cooldown
            }
        }
        if (enemy.moveTowards(this.points[this.currentdest], 75)) {
            this.currentdest = ++this.currentdest % this.points.length
        }
    }
}

class BossStateOne extends EnemyState {
    constructor(enemy) {
        super(enemy)
        this.points = []
        this.points.push(new Vector(700 - 31, 100))
        this.points.push(new Vector(400 - 31, 170))
        this.points.push(new Vector(100 - 31, 100))
        this.points.push(new Vector(400 - 31, 30))
        this.patterns.push(new TripleFlowerPattern(enemy, 3000, 5000, HitBoxType.GREEN22, 16, 300, Math.PI / 2))
        this.patterns.push(new FlowerPattern(enemy, 1500, 5750, HitBoxType.RED22, 16, 300, Math.PI / 2))
        this.patterns.push(new FlowerPattern(enemy, 1500, 5750, HitBoxType.RED22, 16, 500, Math.PI / 2))
        this.patterns.push(new FlowerPattern(enemy, 1500, 5750, HitBoxType.RED22, 16, 700, Math.PI / 2))
        this.currentdest = 0
    }
    update() {
        for (let i = 0; i < this.patterns.length; i++) {
            if (!this.patterns[i].freezeCooldown) {
                this.patterns[i].currentCooldown -= deltaTime
            }
            if (this.patterns[i].currentCooldown <= 0) {
                this.patterns[i].createPattern()
                this.patterns[i].currentCooldown += this.patterns[i].cooldown
            }
        }
        if (enemy.moveTowards(this.points[this.currentdest], 150)) {
            this.currentdest = ++this.currentdest % this.points.length
        }
    }
}
