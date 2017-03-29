"use strict"

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    angle() {
        return (Math.atan(this.y / this.x) + (this.x < 0 ? Math.PI :
            (this.y < 0 ? 2 * Math.PI : 0)))
    }
    clone() {
        return Vector(this.x, this.y)
    }
    normalize() {
        if (this.x == 0 && this.y == 0) {
            return Vector()
        }
        var normal = this.clone()
        var magnitude = this.magnitude()
        normal.x /= magnitude
        normal.y /= magnitude
        return normal
    }
}

function calculateDistance(v1, v2) {
    return Math.sqrt(
        Math.pow(v1.x - v2.x ,2) +
        Math.pow(v1.y - v2.y, 2)
    )
}
