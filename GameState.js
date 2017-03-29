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
        invalidBullets = []
        for (let i = 0; i < enemyBullets.length; i++) {
            enemyBullets[i].update()
        }
    }
}
