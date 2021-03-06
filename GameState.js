"use strict"

class GameState {
    constructor() {}
    update() {
        throw new Error("abstract")
    }
}

class TitleScreenGameState extends GameState {
    constructor() {
        super()
        this.fadeDirection = -1
        this.alpha = 1
    }
    update() {
        uiContext.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
        if (keys[ENTER]) {
            titlebgm.pause()
            menuchimesfx.play()
            enemy.health = 0
            currentGameState = bossInitializationState
            return
        }
        graphicsContext.fillStyle = bgPattern
        graphicsContext.fillRect(0, 0, graphicsCanvas.width, graphicsCanvas.height)
        uiContext.drawImage(titleText, 52, 100)
        this.alpha = this.alpha + this.fadeDirection * 0.00075 * deltaTime
        if (!(0 <= this.alpha && this.alpha <= 1)) {
            this.fadeDirection *= -1
            this.alpha = Math.min(1, Math.max(0, this.alpha))
        }
        uiContext.save()
        uiContext.globalAlpha = this.alpha
        uiContext.drawImage(enterText, 145, 700)
        uiContext.restore()
    }
}

class BossInitializationState extends GameState {
    constructor() {
        super()
    }
    update() {
        uiContext.clearRect(0, 0, enemyBulletCanvas.width, enemyBulletCanvas.height)
        enemy.health += deltaTime * 0.500
        if (enemy.health >= enemy.maxHealth) {
            enemy.health = enemy.maxHealth
            currentGameState = normalGameState
            starttime = Date.now()
        }
        player.redraw(playerContext)
        enemy.redraw(enemyContext)
    }
}

class NormalGameState extends GameState {
    constructor() {
        super()
        this.star1 = true
        this.star2 = true
    }
    update() {
        var hit = false
        graphicsContext.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
        playerContext.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
        enemyContext.clearRect(0, 0, enemyCanvas.width, enemyCanvas.height)
        playerBulletContext.clearRect(0, 0, playerBulletCanvas.width, playerBulletCanvas.height)
        enemyBulletContext.clearRect(0, 0, enemyBulletCanvas.width, enemyBulletCanvas.height)
        uiContext.clearRect(0, 0, enemyBulletCanvas.width, enemyBulletCanvas.height)

        bgOffset += 1
        bgOffset %= 2560
        graphicsContext.fillStyle = bgPattern
        graphicsContext.translate(0, bgOffset)
        graphicsContext.fillRect(0, -bgOffset, WIDTH, HEIGHT)
        graphicsContext.translate(0, -bgOffset)

        star1Offset += 1.2
        star1Offset %= 600
        star2Offset += 1.4
        star2Offset %= 446
        this.star1 = !this.star1
        this.star2 = !this.star2

        if (this.star1) {
            graphicsContext.fillStyle = star1Pattern
            graphicsContext.translate(0, star1Offset)
            graphicsContext.fillRect(0, -star1Offset, WIDTH, HEIGHT)
            graphicsContext.translate(0, -star1Offset)
        }

        if (this.star2) {
            graphicsContext.fillStyle = star2Pattern
            graphicsContext.translate(0, star2Offset)
            graphicsContext.fillRect(200, -star2Offset, WIDTH, HEIGHT)
            graphicsContext.translate(0, -star2Offset)
        }

        player.update()
        player.redraw(playerContext)
        enemy.update()
        enemy.redraw(enemyContext)

        for (let i = 0; i < enemyBullets.length; i++) {
            enemyBullets[i].update()
            enemyBullets[i].redraw()
            if (!enemyBullets[i].checkBounds()) {
                enemyBullets.splice(i--, 1)
                continue
            }
            if (enemyBullets[i].checkCollision()) {
                deathsfx.play()
                uiContext.drawImage(diededText, 144, 200)
                clearInterval(mainTimer)
                keys = []
            }
        }

        for (let i = playerBullets.length - 1; i >= 0; i--) {
            playerBullets[i].update()
            playerBullets[i].redraw()
            if (!playerBullets[i].checkBounds()) {
                playerBullets.splice(i, 1)
                continue
            }
            if (playerBullets[i].checkCollision()) {
                enemy.health--
                hit = true
                playerBullets.splice(i, 1)
            }
        }
        if (hit) {
            var sfx = corehitPool.request()
            sfx.play()
        }

    }
}
