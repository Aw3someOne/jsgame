class ResourcePool {
    constructor() {
        this.pool = []
    }
    request() {
        if (this.pool.length == 0) {
            console.log("empty")
        }
        return this.pool.pop()
    }
    returnToPool(resource) {
        this.pool.push(resource)
    }
}

class AudioPool extends ResourcePool {
    constructor(filepath, count) {
        super()
        this.filepath = filepath
        this.count = count
        while (this.pool.length < count) {
            this.addToPool()
        }
    }
    request() {
        if (this.pool.length == 0) {
            console.log("no more objects, need to create more")
            while (this.pool.length < this.count) {
                this.addToPool()
            }
        }
        return this.pool.pop()
    }
    addToPool() {
        var workaround = this
        var audio = new Audio(this.filepath)
        audio.onended = function() { // automatically return to pool when finished playing
            workaround.returnToPool(audio)
        }
        this.pool.push(audio)
    }
}
