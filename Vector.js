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
        return new Vector(this.x, this.y)
    }
    normalize() {
        if (this.x == 0 && this.y == 0) {
            return new Vector()
        }
        var normal = this.clone()
        var magnitude = this.magnitude()
        normal.x /= magnitude
        normal.y /= magnitude
        return normal
    }
    dot(v2) {
        return this.x * v2.x + this.y * v2.y
    }
    add(v2) {
        return new Vector(this.x + v2.x, this.y + v2.y)
    }
    subtract(v2) {
        return new Vector(this.x - v2.x, this.y - v2.y)
    }
    perpendicular() {
        return new Vector(-this.y, this.x)
    }
}

function calculateDistance(v1, v2) {
    return Math.sqrt(
        Math.pow(v1.x - v2.x ,2) +
        Math.pow(v1.y - v2.y, 2)
    )
}

function collisionTest(lhs, rhs) {
    var lhsVertices = lhs.getVertices()
    var rhsVertices = rhs.getVertices()
    var lhsAxes = getAxes(lhsVertices)
    var rhsAxes = getAxes(rhsVertices)

    for (let i = 0; i < lhsAxes.length; i++) {
        var lhsPro = project(lhsVertices, lhsAxes[i])
        var rhsPro = project(rhsVertices, lhsAxes[i])
        if (!lhsPro.overlap(rhsPro)) {
            return false
        }
    }
    for (let i = 0; i < rhsAxes.length; i++) {
        var lhsPro = project(lhsVertices, rhsAxes[i])
        var rhsPro = project(rhsVertices, rhsAxes[i])
        if (!lhsPro.overlap(rhsPro)) {
            return false
        }
    }
    return true
}

function getAxes(vertices) {
    var axes = []
    for (let i = 0; i < vertices.length; i++) {
        var v1 = vertices[i]
        var v2 = vertices[(i + 1) % vertices.length]
        var edge = v1.subtract(v2)
        axes[i] =  edge.perpendicular()
    }
    return axes
}

function project(vertices, axis) {
    var normalized = axis.normalize()
    var min = normalized.dot(vertices[0])
    var max = min
    for (let i = 1; i < vertices.length; i++) {
        var p = normalized.dot(vertices[i])
        if (p < min) {
            min = p
        } else if (p > max) {
            max = p
        }
    }
    return new Projection(min, max)
}

class Projection {
    constructor(min, max) {
        this.min = min
        this.max = max
    }
    overlap(p2) { // returns true if touching or overlapping
        return !(this.min > p2.max || p2.min > this.max)
    }
}
