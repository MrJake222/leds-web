function submenuHover(ev) {
    $(ev.target).children("ul").fadeToggle(ev.type == "mouseenter" ? 400 : 200)
}