var baseMenu

var mainMenu = [
    {
        title: "Groups",
        sub: []
    },

    {
        title: "username",
        right: true,
        sub: []
    }
]

var logoutMenu = {
    title: "Logout",
    href: "/logout"
}

var adminMenu = {
    title: "Admin",
    sub: [
        {
            title: "Add module",
            href: "/modifyModule"
        },

        {
            title: "Add group",
            href: "/modifyGroup"
        },

        {
            title: "Users",
            href: "/users"
        }
    ]
}

// --------------------------------------------------------------------------------
function generateMenu(login, cb) {
    db.groups.find({}, function(err, docs) {
        if (err)
            throw err

        mainMenu[0].sub = []

        docs.forEach(function(e) {
            mainMenu[0].sub.push({
                title: e.groupName,
                href: "/group?groupID=" + e._id,

                // For listing in "Add module" page
                id: e._id
            })
        })
        
        // baseMenu = mainMenu.slice()
        
        // if (login) {
        db.users.find({login: login}, function(err, docs) {

            mainMenu[1].title = docs[0].username

            if (docs[0].admin)
                mainMenu[1].sub = [adminMenu]                

            mainMenu[1].sub.push(logoutMenu)

            cb(mainMenu, docs[0])
        })
        // }

        // else {
        //     baseMenu.pop()

        //     cb(baseMenu)
        // }
    })
}

// --------------------------------------------------------------------------------
module.exports = {
    generateMenu
}