"use strict"

const TITLEPNG = "img/Welcome.png"
const ENTERPNG = "img/EnterWhite.png"
const SHIPPNG = "img/ship.png"
const BULLETPNG = "img/bullets.png"
const BOSSPNG = "img/boss.png"
const STAR1PNG = "img/Star1.png"
const STAR2PNG = "img/Star2.png"
const BGPNG = "img/BG_2.png"
const DIEDEDPNG = "img/dieded.png"
const WONNEREDPNG = "img/wonnered.png"

const ZEROPNG = "img/0.png"
const ONEPNG = "img/1.png"
const TWOPNG = "img/2.png"
const THREEPNG = "img/3.png"
const FOURPNG = "img/4.png"
const ENEMYPNG = "img/enemy.png"
const TITLENUMBERSPNG = "img/numbers.png"

const LASER = "sfx/Laser2.wav"
const COREHIT = "sfx/CoreHit3.wav"
const SPELLCARD = "sfx/053.wav" // better than SPELLCARD.wav
const PLAYERDEATH = "sfx/DEAD.wav" // or 071
const MENUCHIME = "sfx/048.wav"

const DELAY = 1
const WIDTH = 800
const HEIGHT = 1000

const ENTER = 13
const SHIFT = 16
const SPACE = 32
const LEFT = 37
const UP = 38
const RIGHT = 39
const DOWN = 40

const x = 88
const b = 66
const c = 67

const w = 87
const a = 65
const s = 83
const d = 68

var mainDiv
var graphicsCanvas
var graphicsContext
var playerCanvas
var playerContext
var enemyCanvas
var enemyContext
var playerBulletCanvas
var playerBulletContext
var enemyBulletCanvas
var enemyBulletContext
var uiCanvas
var uiContext

var leaderCanvas
var leaderContext

var titleScreenGameState
var bossInitializationState
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

var titleText = new Image(695, 114)
titleText.src = TITLEPNG
var enterText = new Image(510, 51)
enterText.src = ENTERPNG
var wonneredText = new Image(250, 47)
wonneredText.src = WONNEREDPNG
var diededText = new Image(512, 54)
diededText.src = DIEDEDPNG

var zeroText = new Image(18, 18)
zeroText.src = ZEROPNG
var oneText = new Image(12, 18)
oneText.src = ONEPNG
var twoText = new Image(16, 18)
twoText.src = TWOPNG
var enemyText = new Image(84, 32)
enemyText.src = ENEMYPNG

var titleNumbersSheet = new Image(320, 34)
titleNumbersSheet.src = TITLENUMBERSPNG

var bgSheet = new Image(800, 2560)
bgSheet.src = BGPNG
var star1Sheet = new Image(800, 600)
star1Sheet.src = STAR1PNG
var star2Sheet = new Image(400, 446)
star2Sheet.src = STAR2PNG
var bgPattern
var star1Pattern
var star2Pattern
var bgOffset = 0
var star1Offset = 0
var star2Offset = 0
var shipSheet = new Image(256, 68)
shipSheet.src = SHIPPNG
var shipCount = 4
var bulletSheet = new Image(257, 355)
bulletSheet.src = BULLETPNG
var bossSheet = new Image(76, 82)
bossSheet.src = BOSSPNG

var bgm = new Audio("bgm/alien.mp3")
var menuchimesfx = new Audio(MENUCHIME)
menuchimesfx.onended = function() {
    bgm.play()
}
var deathsfx = new Audio(PLAYERDEATH);

var laserPool = new AudioPool(LASER, 50)
var corehitPool = new AudioPool(COREHIT, 50)

var mainTimer

var hitBoxes = []
var starttime

var v12x12 = [ new Vector(2, 4),
            new Vector(4, 2),
            new Vector(7, 2),
            new Vector(9, 4),
            new Vector(9, 7),
            new Vector(7, 9),
            new Vector(4, 9),
            new Vector(2, 7), ]

var v16x16 = [ new Vector(3, 6),
            new Vector(6, 3),
            new Vector(9, 3),
            new Vector(12, 6),
            new Vector(12, 9),
            new Vector(9, 12),
            new Vector(6, 12),
            new Vector(3, 9), ]

var v22x22 = [ new Vector(3, 8),
            new Vector(8, 2),
            new Vector(13, 2),
            new Vector(18, 8),
            new Vector(18, 14),
            new Vector(13, 19),
            new Vector(8, 19),
            new Vector(3, 14), ]

var v8x16 = [ new Vector(1, 5),
            new Vector(3, 2),
            new Vector(4, 2),
            new Vector(6, 5),
            new Vector(6, 9),
            new Vector(4, 12),
            new Vector(3, 12),
            new Vector(1, 9), ]

var vKunai = [ new Vector(1, 8),
            new Vector(6, 8),
            new Vector(4, 14),
            new Vector(3, 14), ]

var v76x82 = [ new Vector(0, 20),
            new Vector(75, 20),
            new Vector(61, 81),
            new Vector(14, 81), ]

const HitBoxType = {
    BLUE12:     0,
    BLUE16:     1,
    RED22:      22,
    PURPLE22:   23,
    BLUE22:     24,
    CYAN22:     25,
    GREEN22:    26,
    YELLOW22:   27,
    GREEN62:    62,
    RED8X16:    816,
    REDKUNAI:   666,
    GREENBOSS76X82: 76,
}

hitBoxes[HitBoxType.BLUE12] =
        new HitBox(bulletSheet, new Vector(99, 137), new Vector(12, 12), 6.5, v12x12)
hitBoxes[HitBoxType.BLUE16] = 
        new HitBox(bulletSheet, new Vector(97, 68), new Vector(16, 16), 6.5, v16x16)
hitBoxes[HitBoxType.RED22] =
        new HitBox(bulletSheet, new Vector(38, 253), new Vector(22, 22), 9, v22x22)
hitBoxes[HitBoxType.PURPLE22] =
        new HitBox(bulletSheet, new Vector(70, 253), new Vector(22, 22), 9, v22x22)
hitBoxes[HitBoxType.BLUE22] =
        new HitBox(bulletSheet, new Vector(102, 253), new Vector(22, 22), 9, v22x22)
hitBoxes[HitBoxType.CYAN22] =
        new HitBox(bulletSheet, new Vector(134, 253), new Vector(22, 22), 9, v22x22)
hitBoxes[HitBoxType.GREEN22] =
        new HitBox(bulletSheet, new Vector(166, 253), new Vector(22, 22), 9, v22x22)
hitBoxes[HitBoxType.YELLOW22] =
        new HitBox(bulletSheet, new Vector(198, 253), new Vector(22, 22), 9, v22x22)
hitBoxes[HitBoxType.GREEN62] =
        new HitBox(bulletSheet, new Vector(128, 293), new Vector(62, 62), 31, v22x22)
hitBoxes[HitBoxType.RED8X16] =
        new HitBox(bulletSheet, new Vector(37, 85), new Vector(8, 16), 0, v8x16) 
hitBoxes[HitBoxType.REDKUNAI] =
        new HitBox(bulletSheet, new Vector(37, 102), new Vector(8, 16), 0, vKunai)
hitBoxes[HitBoxType.GREENBOSS76X82] = new HitBox(bossSheet, new Vector(), new Vector(76, 82), 0, v76x82)

onload = function() {
    mainDiv = document.createElement("div")
    mainDiv.id = "main"
    mainDiv.style.minWidth = WIDTH
    mainDiv.style.maxWidth = WIDTH
    mainDiv.style.minHeight = HEIGHT
    mainDiv.style.maxHeight = HEIGHT
    mainDiv.style.backgroundColor = "CCC"
    document.body.appendChild(mainDiv)

    graphicsCanvas = document.createElement("canvas")
    graphicsCanvas.width = WIDTH
    graphicsCanvas.height = HEIGHT
    graphicsContext = graphicsCanvas.getContext("2d")

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

    enemyBulletCanvas = document.createElement("canvas")
    enemyBulletCanvas.width = WIDTH
    enemyBulletCanvas.height = HEIGHT
    enemyBulletContext = enemyBulletCanvas.getContext("2d")

    uiCanvas = document.createElement("canvas")
    uiCanvas.width = WIDTH
    uiCanvas.height = HEIGHT
    uiContext = uiCanvas.getContext("2d")

    bgPattern = graphicsContext.createPattern(bgSheet, "repeat")
    star1Pattern = graphicsContext.createPattern(star1Sheet, "repeat")
    star2Pattern = graphicsContext.createPattern(star2Sheet, "repeat")

    leaderCanvas = document.createElement("canvas")
    leaderCanvas.width = WIDTH
    leaderCanvas.height = HEIGHT
    leaderCanvas.id = "leaderboard"
    leaderContext = leaderCanvas.getContext("2d")

    mainDiv.appendChild(graphicsCanvas)
    mainDiv.appendChild(enemyBulletCanvas)
    mainDiv.appendChild(playerBulletCanvas)
    mainDiv.appendChild(playerCanvas)
    mainDiv.appendChild(enemyCanvas)
    mainDiv.appendChild(uiCanvas)
    mainDiv.appendChild(leaderCanvas)

    titleScreenGameState = new TitleScreenGameState()
    bossInitializationState = new BossInitializationState()
    normalGameState = new NormalGameState()
    currentGameState = titleScreenGameState
    timeOfLastUpdate = Date.now()

    player = new Player()

    player.position = new Vector((WIDTH - hitBoxes[player.hitboxType].width) / 2, HEIGHT - 50)

    enemy = new Boss()
    enemy.position = new Vector((WIDTH - hitBoxes[enemy.hitboxType].width) / 2, 50)
    mainTimer = setInterval(mainLoop, 1)

    getTimes()
}

function gameStart() {
    bgm.play()
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
    if (e.keyCode == SPACE) {
        autofire = !autofire
    }
}

onkeyup = function(e) {
    keys[e.keyCode] = false
}
