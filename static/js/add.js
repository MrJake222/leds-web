var warnLevel = {}

function setWarn(set, text, smooth=true) {
    console.log(set, text, warnLevel)

    var warn = $("#addressWarn")
    var submit = $("input[type=submit]")

    if (set) {
        warnLevel[text] = true

        warn.html("Error: " + text)
    }

    else {
        delete warnLevel[text]
    }

    if (Object.keys(warnLevel).length == 0) {
        warn.slideUp()
        submit.slideDown()
    }

    else {
        warn.html("Error: " + Object.keys(warnLevel)[0])

        if (smooth) {
            warn.slideDown()
            submit.slideUp()
        }

        else {
            warn.show()
            submit.hide()
        }
    }

    console.log("warnLevel: ", warnLevel)
}

function checkAddress(smooth=true) {
    var modAddress = $("input[name=modAddress]")[0]
    
    //- if (modAddress == undefined)
    //-     return
    
    modAddress = modAddress.value
    var action = $("input[name=action]")[0].value

    $.post(
        {
            url: "/checkAddress",
            dataType: "json"
        },
        
        {
            action: action,
            modAddress: modAddress
        },
        
        function(data) {
            setWarn(data.error, data.error, smooth)
        }
    )
}

function checkPasswords(smooth=true) {
    var p = $("input[name=password]")

    //- console.log(p)

    if (p.length != 2)
        return

    setWarn(!(p[0].value == p[1].value), "Passwords do not match", smooth)
}

function checkLogin(smooth=true) {
    var login = $("input[name=login]")[0].value

    if (login.length == 0) {
        setWarn(true, "Login can't be empty", smooth)
    }

    else {
        setWarn(false, "Login can't be empty", smooth)

        $.post(
            {
                url: "/checkLogin",
                dataType: "json"
            },
            
            {
                login: $("input[name=login]")[0].value
            },
            
            function(data) {
                setWarn(data.error, "Duplicate login", smooth)
            }
        )
    }
}

function checkUsername(smooth=true) {
    var login = $("input[name=username]")[0].value

    setWarn(login.length == 0, "Username can't be empty", smooth)
}

function check(ev, title, _name, smooth) {
    var name

    if (_name)
        name = _name

    else
        name = ev.target.name

    switch (name) {
        case "modAddress":
            checkAddress(smooth)
            break

        case "password":
            if (title == "Add user")
                checkPasswords(smooth)
            break

        case "login":
            if (title == "Add user")
                checkLogin(smooth)
            break

        case "username":
            if (title == "Add user")
                checkUsername(smooth)
            break

        default:
            break
    }
}

function onSubmit(event) {
    if (Object.keys(warnLevel).length == 0)
        return true
        
    event.preventDefault()

    return false
} 