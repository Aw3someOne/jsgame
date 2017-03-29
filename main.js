"use strict"

const BULLETPNG = "img/bullets.png"

const DELAY = 5 
const WIDTH = 800
const HEIGHT = 1000

const SHIFT = 16
const SPACE = 32
const LEFT = 37
const UP = 38
const RIGHT = 39
const DOWN = 40

const b = 66
const c = 67

const w = 87
const a = 65
const s = 83
const d = 68

var mainDiv
var normalGameState
var currentGameState
var deltaTime
var deltaSeconds
var timeOfLastUpdate
var keys = []
var autofire = false
var playerBullets = []
var enemyBullets = []

var player
var enemy

var mainTimer

onload = function() {
    mainDiv = document.createElement("div")
    mainDiv.id = "main"
    mainDiv.style.minWidth = WIDTH
    mainDiv.style.maxWidth = WIDTH
    mainDiv.style.minHeight = HEIGHT
    mainDiv.style.maxHeight = HEIGHT
    mainDiv.style.backgroundColor = "CCC"
    document.body.appendChild(mainDiv)
    
    normalGameState = new NormalGameState()
    currentGameState = normalGameState
    timeOfLastUpdate = Date.now()

    player = new Player()
    player.position = new Vector((WIDTH - player.hitbox.image.width) / 2, HEIGHT - 50)
    player.addto(mainDiv)
    player.redraw()

    enemy = new Boss()
    enemy.position = new Vector((WIDTH - enemy.hitbox.image.width) / 2, 50)
    enemy.addto(mainDiv)
    enemy.redraw()

    mainTimer = setInterval(mainLoop, 1)
}

function mainLoop() {
    var time = Date.now()
    deltaTime = time - timeOfLastUpdate
    deltaSeconds = deltaTime / 1000
    if (deltaTime < DELAY) { // not enough time has passed
        return
    }
    currentGameState.update()
    timeOfLastUpdate = time
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

onkeydown = function(e) {
    keys[e.keyCode] = true
    if (e.keyCode == c) {
        autofire = !autofire
    }
}

onkeyup = function(e) {
    keys[e.keyCode] = false
}
