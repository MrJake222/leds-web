function valChange(ev) {
    var range = $(ev.target)
    var value = range.prev().children().first()
    
    value.html(range.val())
}

function updateRanges() {
    $("section").each(function(index, obj) {
        $(obj).children(".row").each(function(index2, obj2) {
            // .row children
            var children = obj2.children

            // rangeName --> span
            var value = children[0].children[0]

            // input
            var input = children[1]
            
            $(input).val(value.innerHTML)
        })
    })
}