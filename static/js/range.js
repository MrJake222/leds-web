function valChange(ev) {
    var range = $(ev.target)
    var value = range.prev().children().first()
    
    value.html(range.val())
}