var Datastore = require("nedb")

groups = new Datastore({
    filename: "db/groups.db",
    autoload: true
})

// --------------------------------------------------------------------------------
modules = new Datastore({
    filename: "db/modules.db",
    autoload: true
})

// --------------------------------------------------------------------------------
users = new Datastore({
    filename: "db/users.db",
    autoload: true
})

// --------------------------------------------------------------------------------
preset = new Datastore({
    filename: "db/preset.db",
    autoload: true
})

// --------------------------------------------------------------------------------
module.exports = {
    groups,
    modules,
    users,
    preset
}