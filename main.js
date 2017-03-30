"use strict"

const BULLETPNG = "img/bullets.png"

const DELAY = 16 
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
var playerCanvas
var playerContext
var enemyCanvas
var enemyContext
var playerBulletCanvas
var playerBulletContext
var enemyBulletCanvas
var enemyBulletContext

var normalGameState
var currentGameState
var deltaTime
var deltaSeconds
var timeOfLastUpdate
var keys = []
var autofire = true
var playerBullets = []
var enemyBullets = []

var player
var enemy

var bulletSheet = new Image(257, 355)
bulletSheet.src = BULLETPNG

var mainTimer

var hitBoxes = []

hitBoxes[HitBoxType.BLUE12] =
        new HitBox(bulletSheet, new Vector(99, 137), new Vector(12, 12), 6.5)
hitBoxes[HitBoxType.BLUE16] = 
        new HitBox(bulletSheet, new Vector(97, 68), new Vector(16, 16), 6.5)
hitBoxes[HitBoxType.RED22] =
        new HitBox(bulletSheet, new Vector(38, 253), new Vector(22, 22), 9)
hitBoxes[HitBoxType.PURPLE22] =
        new HitBox(bulletSheet, new Vector(70, 253), new Vector(22, 22), 9)
hitBoxes[HitBoxType.BLUE22] =
        new HitBox(bulletSheet, new Vector(102, 253), new Vector(22, 22), 9)
hitBoxes[HitBoxType.CYAN22] =
        new HitBox(bulletSheet, new Vector(134, 253), new Vector(22, 22), 9)
hitBoxes[HitBoxType.GREEN22] =
        new HitBox(bulletSheet, new Vector(166, 253), new Vector(22, 22), 9)
hitBoxes[HitBoxType.YELLOW22] =
        new HitBox(bulletSheet, new Vector(198, 253), new Vector(22, 22), 9)
hitBoxes[HitBoxType.GREEN62] =
        new HitBox(bulletSheet, new Vector(128, 293), new Vector(62, 62), 31)

onload = function() {
    console.log(bulletSheet)
    mainDiv = document.createElement("div")
    mainDiv.id = "main"
    mainDiv.style.minWidth = WIDTH
    mainDiv.style.maxWidth = WIDTH
    mainDiv.style.minHeight = HEIGHT
    mainDiv.style.maxHeight = HEIGHT
    mainDiv.style.backgroundColor = "CCC"
    document.body.appendChild(mainDiv)

    playerCanvas = document.createElement("canvas")
    playerCanvas.width = WIDTH
    playerCanvas.height = HEIGHT
    playerContext = playerCanvas.getContext("2d")

    enemyCanvas = document.createElement("canvas")
    enemyCanvas.width = WIDTH
    enemyCanvas.height = HEIGHT
    enemyContext = enemyCanvas.getContext("2d")

    playerBulletCanvas = document.createElement("canvas")
    playerBulletCanvas.width = WIDTH
    playerBulletCanvas.height = HEIGHT
    playerBulletContext = playerBulletCanvas.getContext("2d")
    mainDiv.appendChild(playerBulletCanvas)

    enemyBulletCanvas = document.createElement("canvas")
    enemyBulletCanvas.width = WIDTH
    enemyBulletCanvas.height = HEIGHT
    enemyBulletContext = enemyBulletCanvas.getContext("2d")
    mainDiv.appendChild(enemyBulletCanvas)

    mainDiv.appendChild(playerCanvas)
    mainDiv.appendChild(enemyCanvas)
    normalGameState = new NormalGameState()
    currentGameState = normalGameState
    timeOfLastUpdate = Date.now()

    player = new Player()

    player.position = new Vector((WIDTH - hitBoxes[player.hitboxType].width) / 2, HEIGHT - 50)
    player.redraw(playerContext)

    enemy = new Boss()
    enemy.position = new Vector((WIDTH - hitBoxes[enemy.hitboxType].width) / 2, 50)
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
