function submenuHover(ev) {
    var el = $(ev.target).children("ul")

    el.stop()
    el.slideToggle(ev.type == "mouseenter" ? 400 : 200)
}