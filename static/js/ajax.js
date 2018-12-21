function deleteModule(modID) {
    console.log("deleting module " + modID)

    $.post("/modifyModule", {
        action: "delete",
        modID: modID
    }, function() {
        console.log("Done")
        location.reload()
    });
}

function deleteGroup(groupID) {
    console.log("deleting group " + groupID)

    $.post("/modifyGroup", {
        action: "delete",
        groupID: groupID
    }, function() {
        console.log("Done")
        location.assign("/")
    });
}