var baseMenu = [
    {
        title: "Groups",
        sub: []
    },

    {
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
        ]
    }
]

// --------------------------------------------------------------------------------
function generateMenu(callback) {
    db.groups.find({}, function(err, docs) {
        if (err)
            throw err

        baseMenu[0].sub = []

        docs.forEach(function(e) {
            baseMenu[0].sub.push({
                title: e.groupName,
                href: "/group?groupID=" + e._id,

                // For listing in "Add module" page
                id: e._id
            })
        })
        
        callback()
    })
}

// --------------------------------------------------------------------------------
module.exports = {
    baseMenu,
    generateMenu
}