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
        player.update()
        player.redraw()
        enemy.update()
        enemy.redraw()

        // move enemyBullets
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            enemyBullets[i].update()
            enemyBullets[i].redraw()
            if (!enemyBullets[i].checkBounds()) {
                enemyBullets[i].remove()
                enemyBullets.splice(i, 1)
                continue
            }
            enemyBullets[i].checkCollision()
        }

        for (let i = playerBullets.length - 1; i >= 0; i--) {
            playerBullets[i].update()
            playerBullets[i].redraw()
            if (!playerBullets[i].checkBounds()) {
                playerBullets[i].remove()
                playerBullets.splice(i, 1)
                continue
            }
            if (playerBullets[i].checkCollision()) {
                playerBullets[i].remove()
                playerBullets.splice(i, 1)
            }
        }
    }
}
