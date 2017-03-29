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
        var invalidBullets = []
        // move enemyBullets
        for (let i = 0; i < enemyBullets.length; i++) {
            enemyBullets[i].update()
            enemyBullets[i].redraw()
            if (!enemyBullets[i].checkBounds()) {
                invalidBullets.push(i)
                enemyBullets[i].remove()
            }
        }
        // delete out of bounds bullets
        while (invalidBullets.length) {
            enemyBullets.splice(invalidBullets.pop(), 1)
        }

        for (let i= 0; i < playerBullets.length; i++) {
            playerBullets[i].update()
            playerBullets[i].redraw()
            if (!playerBullets[i].checkBounds()) {
                invalidBullets.push(i)
                playerBullets[i].remove()
            }
        }
        while (invalidBullets.length) {
            playerBullets.splice(invalidBullets.pop(), 1)
        }

        player.update()
        player.redraw()
        enemy.update()
        enemy.redraw()

        for (let i = 0; i < enemyBullets.length; i++) {
            enemyBullets[i].checkCollision()
        }

        for (let i = 0; i < playerBullets.length; i++) {
            if (playerBullets[i].checkCollision()) {
                invalidBullets.push(i)
                playerBullets[i].remove()
            }
        }

        while (invalidBullets.length) {
            playerBullets.splice(invalidBullets.pop(), 1)
        }

    }
}
