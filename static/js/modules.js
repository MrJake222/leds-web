function deleteModule(id) {
    console.log("deleting " +id)

    $.post("/delModule", { id: id }, function(data) {
        console.log("Done")
        location.reload()
    });
}

function deleteGroup(id) {
    console.log("deleting " +id)

    $.post("/delGroup", { id: id }, function(data) {
        console.log("Done")
        location.assign("/")
    });
}