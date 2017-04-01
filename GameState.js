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
    }
    update() {
        uiContext.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
        if (keys[ENTER]) {
            bgm.play()
            enemy.health = 0
            currentGameState = bossInitializationState
            return
        }
        uiContext.beginPath()
        uiContext.font = "30px Arial"
        uiContext.textAlign = "center"
        uiContext.fillText("Welcome to Bullet Hell", graphicsCanvas.width / 2, 100)
        uiContext.fillText("Press Enter", graphicsCanvas.width / 2, 700)

        uiContext.stroke()
    }
}

class BossInitializationState extends GameState {
    constructor() {
        super()
    }
    update() {
        enemy.health += deltaTime * 0.500
        if (enemy.health >= enemy.maxHealth) {
            enemy.health = enemy.maxHealth
            currentGameState = normalGameState
        }
        player.redraw(playerContext)
        enemy.redraw(enemyContext)
    }
}

class NormalGameState extends GameState {
    constructor() {
        super()
    }
    update() {
        var hit = false
        graphicsContext.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
        playerContext.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
        enemyContext.clearRect(0, 0, enemyCanvas.width, enemyCanvas.height)
        playerBulletContext.clearRect(0, 0, playerBulletCanvas.width, playerBulletCanvas.height)
        enemyBulletContext.clearRect(0, 0, enemyBulletCanvas.width, enemyBulletCanvas.height)
        uiContext.clearRect(0, 0, enemyBulletCanvas.width, enemyBulletCanvas.height)

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
                var sfx = new Audio(PLAYERDEATH)
                sfx.play()
                uiContext.beginPath()
                uiContext.font = "30px Arial"
                uiContext.textAlign = "center"
                uiContext.fillStyle = "#000000"
                uiContext.fillText("You died", uiCanvas.width / 2, 200)
                uiContext.stroke()
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
