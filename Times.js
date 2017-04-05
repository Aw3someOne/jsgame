function insertTime(name, time) {
    console.log(name + " " + time)
    var data = { name: name, time: time }
    $.ajax({
        type: 'post',
        url: 'insertTime.php',
        data: data,
        dataType: 'json',
        success: function(data) {
            console.log(data)
            if (data['status'] == 'success') {
                getTimes()
            }
        },
        error: function(data) {
            console.log(data)
        }
    })
}

function getTimes() {
    var rowHeight = 40
    var rowNumber = 0
    var firstRow = 155
    var charWidth = 32
    var charHeight = 32
    var col0End = 84
    var col1End = 408
    var col2End = 696
    var colPadding = 10
    var letterOffset = 49 // A is sprite 49
    var lettersPerRow = 16
    $.ajax({
        type: 'post',
        url: 'getTimes.php',
        dataType: 'json',
        success: function(data) {
            leaderContext.clearRect(0, 0, leaderCanvas.width, leaderCanvas.height)
            leaderContext.drawImage(borderSheet, 0, 0)
            $.each(data, function(k, v) {
                var name = v['name'].toLowerCase()
                var akey = 'a'.charCodeAt(0)
                var zkey = 'z'.charCodeAt(0)
                var charOffset = 0
                
                var place = k + 1
                while (place > 0) {
                    var digit = Math.floor(place % 10)
                    place = Math.floor(place / 10)
                    charOffset += charWidth
                    leaderContext.drawImage(titleNumbersSheet, charWidth * digit, 0, charWidth, charHeight, col0End - charOffset, k * rowHeight + firstRow, charWidth, charHeight)
                }
                
                charOffset = 0

                while (name.length > 0) {
                    var c = name.substr(-1)
                    name = name.slice(0, -1)
                    var ckey = c.charCodeAt(0)
                    if (akey <= ckey <= zkey) {
                        var letterNumber = ckey - akey + letterOffset
                        var letterRow = Math.floor(letterNumber / lettersPerRow)
                        var letterColumn = Math.floor(letterNumber % lettersPerRow)
                        charOffset += charWidth
                        var sx = letterColumn * charWidth
                        var sy = letterRow * charWidth
                        var sw = charWidth
                        var sh = charWidth
                        var dx = col1End - charOffset
                        var dy = k * rowHeight + firstRow
                        var dw = charWidth
                        var dh = charHeight
                        leaderContext.drawImage(lettersSheet, sx, sy, sw, sh, dx, dy, dw, dh)
                    }
                }

                var time = v['time']
                charOffset = 0
                while (time > 0) {
                    var digit = Math.floor(time % 10)
                    time = Math.floor(time / 10)
                    charOffset +=charWidth
                    leaderContext.drawImage(titleNumbersSheet, charWidth * digit, 0, charWidth, charHeight, col2End - charOffset, k * rowHeight + firstRow, charWidth, charHeight)
                }
            })
        },
        error: function(data) {
            console.log(data)
            leaderContext.clearRect(0, 0, leaderCanvas.width, leaderCanvas.height)
            leaderContext.drawImage(borderSheet, 0, 0)
        }
    })
}
