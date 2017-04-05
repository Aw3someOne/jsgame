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
        },
        error: function(data) {
            console.log(data)
        }
    })
}

function getTimes() {
    var rowHeight = 34
    var rowNumber = 0
    var charWidth = 32
    var col0End = 2 * charWidth
    var col1End = 10 * charWidth + col0End
    var col2End = 10 * charWidth + col1End
    var colPadding = 10
    $.ajax({
        type: 'post',
        url: 'getTimes.php',
        dataType: 'json',
        success: function(data) {
            leaderContext.fillStyle = "#000000"
            leaderContext.clearRect(0, 0, leaderCanvas.width, leaderCanvas.height)
            // leaderContext.fillRect(0, 0, leaderCanvas.width, leaderCanvas.height)
            $.each(data, function(k, v) {
                console.log("name: " + v['name'] + " time: " + v['time'])
                var name = v['name']
                var time = v['time']
                var scoreOffset = 0
                while (time > 0) {
                    var digit = Math.floor(time % 10)
                    time = Math.floor(time / 10)
                    scoreOffset +=charWidth
                    leaderContext.drawImage(titleNumbersSheet, charWidth * digit, 0, charWidth, 34, col2End - scoreOffset, k * 34, charWidth, 34)
                }
            })
        },
        error: function(data) {
            console.log(data)
            leaderContext.fillStyle = "#000000"
            leaderContext.clearRect(0, 0, leaderCanvas.width, leaderCanvas.height)
            leaderContext.fillRect(0, 0, leaderCanvas.width, leaderCanvas.height)
        }
    })
}
