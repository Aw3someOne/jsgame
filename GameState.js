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
        graphicsContext.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
        if (keys[ENTER]) {
            bgm.play()
            enemy.health = 0
            currentGameState = bossInitializationState
            return
        }
        graphicsContext.beginPath()
        graphicsContext.font = "30px Arial"
        graphicsContext.textAlign = "center"
        graphicsContext.fillText("Welcome to Bullet Hell", graphicsCanvas.width / 2, 100)
        graphicsContext.fillText("Press Enter", graphicsCanvas.width / 2, 700)

        graphicsContext.stroke()
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

        player.update()
        player.redraw(playerContext)
        enemy.update()
        enemy.redraw(enemyContext)

/*
        // move enemyBullets
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            enemyBullets[i].update()
            enemyBullets[i].redraw()
            if (!enemyBullets[i].checkBounds()) {
                enemyBullets.splice(i, 1)
                continue
            }
            enemyBullets[i].checkCollision()
        }
*/


        for (let i = 0; i < enemyBullets.length; i++) {
            enemyBullets[i].update()
            enemyBullets[i].redraw()
            if (!enemyBullets[i].checkBounds()) {
                enemyBullets.splice(i--, 1)
                continue
            }
            enemyBullets[i].checkCollision()
        }

        for (let i = playerBullets.length - 1; i >= 0; i--) {
            playerBullets[i].update()
            playerBullets[i].redraw()
            if (!playerBullets[i].checkBounds()) {
                playerBullets.splice(i, 1)
                continue
            }
            if (playerBullets[i].checkCollision()) {
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
