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
module.exports = {
    groups,
    modules
}