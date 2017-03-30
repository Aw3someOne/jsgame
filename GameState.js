"use strict"

class GameState {
    constructor() {}
    update() {
        throw new Error("abstract")
    }
}

class NormalGameState extends GameState {
    constructor() {
        super()
    }
    update() {
        playerContext.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
        enemyContext.clearRect(0, 0, enemyCanvas.width, enemyCanvas.height)
        playerBulletContext.clearRect(0, 0, playerBulletCanvas.width, playerBulletCanvas.height)
        enemyBulletContext.clearRect(0, 0, enemyBulletCanvas.width, enemyBulletCanvas.height)

        player.update()
        player.redraw(playerContext)
        enemy.update()
        enemy.redraw(enemyContext)

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

        for (let i = playerBullets.length - 1; i >= 0; i--) {
            playerBullets[i].update()
            playerBullets[i].redraw()
            if (!playerBullets[i].checkBounds()) {
                playerBullets.splice(i, 1)
                continue
            }
            if (playerBullets[i].checkCollision()) {
                playerBullets.splice(i, 1)
            }
        }
    }
}
