"use strict"

class Pattern {
    constructor(enemy, cooldown = 500, initialCooldown = 0, hitboxType = HitBoxType.RED22) {
        this.enemy = enemy
        this.cooldown = cooldown
        this.currentCooldown = initialCooldown
        this.hitboxType = hitboxType
        this.hitboxType = hitboxType
    }
    update() {
        throw new Error("Pattern::update() not overridden")
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
    constructor(enemy, cooldown = 1000, initialCooldown = 0, hitboxType = HitBoxType.RED22, count = 16, speed = 200, rot = Math.PI / 2, stepAngle = Math.PI / 12, delay = 25) {
        super(enemy, cooldown, initialCooldown, hitboxType)
        this.vectors = []
        this.count = count
        this.speed = speed
        this.rot = rot
        this.step = stepAngle
        this.index = 0
        this.delay = delay
        this.i = 0
        for (let i = 0; i < count; i++) {
            var angle = this.step * i + rot
            this.vectors[i] = new Vector(speed * Math.cos(angle), speed * Math.sin(angle))
        }
    }
    update() {
        this.currentCooldown -= deltaTime
        if (this.currentCooldown <= 0) {
            this.i %= this.count
            var bullet = new EnemyBullet(new Vector(this.enemy.position.x + (hitBoxes[this.enemy.hitboxType].width - hitBoxes[this.hitboxType].width) / 2,
                this.enemy.position.y + (hitBoxes[this.enemy.hitboxType].height - hitBoxes[this.hitboxType].height) / 2), this.vectors[this.i], this.hitboxType)
            enemyBullets.push(bullet)
            this.currentCooldown += (++this.i == this.count ? this.cooldown: this.delay)
        }
    }
}

class FlowerPattern extends Pattern {
    constructor(enemy, cooldown = 500, initialCooldown = 0, hitboxType = HitBoxType.RED22, count = 16, speed = 200, rot = Math.PI / 2) {
        super(enemy, cooldown, initialCooldown, hitboxType)
        this.count = count
        this.speed = speed
        this.rot = rot
        this.step = 2 * Math.PI / count
    }
    update() {
        this.currentCooldown -= deltaTime
        if (this.currentCooldown <= 0) {
            this.flower(this.enemy.position, this.rot)
            this.currentCooldown += this.cooldown
        }
    }
    flower(position, rot = Math.PI / 2) {
        for (let i = 0; i < this.count; i++) {
            var angle = this.step * i + rot
            var bullet = new EnemyBullet(new Vector(position.x + (hitBoxes[this.enemy.hitboxType].width - hitBoxes[this.hitboxType].width) / 2,
                position.y + (hitBoxes[this.enemy.hitboxType].height - hitBoxes[this.hitboxType].height) / 2), 
                new Vector(this.speed * Math.cos(angle), this.speed * Math.sin(angle)), this.hitboxType)
            enemyBullets.push(bullet)
        }
    }
}

class MultiFlowerPattern extends FlowerPattern {
    constructor(enemy, cooldown = 500, initialCooldown = 0, hitboxTypes, count = 16, speeds = [200], rot, delay = 200, alternate = true, offset = Math.PI / 64) {
        super(enemy, cooldown, initialCooldown, hitboxTypes[0], count, speeds[0], rot)
        this.allvectors = []
        this.speeds = speeds
        this.hitboxTypes = hitboxTypes
        this.rot = rot
        this.step = 2 * Math.PI / count
        this.i = 0
        this.delay = delay
        this.alternate = true
        this.direction = 1
        this.offset = offset
    }
    update() {
        this.currentCooldown -= deltaTime
        if (this.currentCooldown <= 0) {
            this.i %= this.hitboxTypes.length
            this.speed = this.speeds[this.i]
            this.hitboxType = this.hitboxTypes[this.i]
            this.flower(this.enemy.position, this.rot + this.i * this.direction * this.offset)
            ++this.i
            this.currentCooldown += (this.i == this.hitboxTypes.length ? this.cooldown: this.delay)
            if (this.i == this.hitboxTypes.length && this.alternate) {
                this.direction *= -1
            }
        }
    }
}

class TransitionState extends EnemyState {
    constructor(enemy, nextState, point = new Vector(), speed = 150) {
        super(enemy)
        this.point = point
        this.nextState = nextState
        this.speed = speed
    }
    update() {
        if (this.enemy.moveTowards(this.point, this.speed)) {
            this.enemy.currentState = this.enemy.states[this.nextState]
            this.enemy.health = this.enemy.maxHealth
            this.enemy.statesRemaining--
        }
    }
}

class BossMultiFlowerState extends EnemyState {
    constructor(enemy) {
        super(enemy)
        this.points = []
        this.points.push(new Vector(700 - 31, 200))
        this.points.push(new Vector(400 - 31, 350))
        this.points.push(new Vector(100 - 31, 200))
        this.points.push(new Vector(400 - 31, 50))
        this.currentdest = 0
        this.shooting = true
        this.hitboxTypes = []
        this.hitboxTypes.push(HitBoxType.CYAN22)
        this.hitboxTypes.push(HitBoxType.GREEN22)
        this.hitboxTypes.push(HitBoxType.YELLOW22)
        this.hitboxTypes.push(HitBoxType.RED22)
        this.hitboxTypes.push(HitBoxType.PURPLE22)
        this.hitboxTypes.push(HitBoxType.CYAN22)
        this.hitboxTypes.push(HitBoxType.GREEN22)
        this.hitboxTypes.push(HitBoxType.YELLOW22)
        this.hitboxTypes.push(HitBoxType.RED22)
        this.hitboxTypes.push(HitBoxType.PURPLE22)
        this.speeds = []
        for (let i = 0; i < this.hitboxTypes.length; i++) {
            this.speeds[i] = 75 - 5 * i
        }
        //this.patterns.push(new MultiFlowerPattern(enemy, 1000, 0, this.hitboxTypes, 16, this.speeds, Math.PI / 2, 150, true,  Math.PI / 64))
        this.patterns.push(new MultiFlowerPattern(enemy, 1000, 0, this.hitboxTypes, 16, this.speeds, Math.PI / 2, 150, true,  9000))
    }
    update() {
        if (this.enemy.health <= 0) {
            this.enemy.currentState = this.enemy.states[1]
            console.log("moving to next stage")
            enemyBullets = []
            return
        }
        this.currentWait -= deltaTime
        if (this.shooting) {
            for (let i = 0; i < this.patterns.length; i++) {
                this.patterns[i].update()
            }
        }
        if (this.patterns[0].i  == this.hitboxTypes.length) {
            this.shooting = false
            if (this.enemy.moveTowards(this.points[this.currentdest], 150)) {
                this.shooting = true
                this.patterns[0].currentCooldown = 0
                this.currentdest = ++this.currentdest % this.points.length
            }
        }
    }
}

class BossSpiralState extends EnemyState {
    constructor(enemy) {
        super(enemy)
        this.points = []
        this.points.push(new Vector(700 - 31, 100))
        this.points.push(new Vector(400 - 31, 400))
        this.points.push(new Vector(100 - 31, 100))
        this.points.push(new Vector(400 - 31, 30))
        this.currentdest = 0
        this.shooting = true
        this.patterns = []
        this.patterns.push(new SpiralPattern(enemy, 1000, 0, HitBoxType.PURPLE22, 120, 100, Math.PI / 2, Math.PI / 40, 15))
        this.patterns.push(new SpiralPattern(enemy, 1000, 0, HitBoxType.YELLOW22, 120, 100, -Math.PI / 2, Math.PI / 40, 15))
    }
    update() {
        if (this.enemy.health <= 0) {
            throw new Error("not implemented")
        }
        this.currentWait -= deltaTime
        if (this.shooting) {
            for (let i = 0; i < this.patterns.length; i++) {
                this.patterns[i].update()
            }
        }
        if (this.patterns[0].i == this.patterns[0].count) {
            this.shooting = false
            if (this.enemy.moveTowards(this.points[this.currentdest], 400)) {
                this.shooting = true
                this.patterns[0].currentCooldown = 0
                this.patterns[1].currentCooldown = 0
                this.currentdest = ++this.currentdest % this.points.length
            }
        }
    }
}

class BossStateOne extends EnemyState {
    constructor(enemy) {
        super(enemy)
        this.points = []
        this.points.push(new Vector(400 - 31, 30))
        this.points.push(new Vector(700 - 31, 100))
        this.points.push(new Vector(400 - 31, 170))
        this.points.push(new Vector(100 - 31, 100))
        this.shooting = true
        this.hitboxTypes = []
        this.hitboxTypes.push(HitBoxType.RED22)
        this.hitboxTypes.push(HitBoxType.RED22)
        this.hitboxTypes.push(HitBoxType.RED22)
    }
    update() {
        if (this.shooting) {
            for (let i = 0; i < this.patterns.length; i++) {
                this.patterns[i].update()
            }
        }
        if (enemy.moveTowards(this.points[this.currentdest], 150)) {
            this.currentdest = ++this.currentdest % this.points.length
            this.shooting = true
        }
    }
}
