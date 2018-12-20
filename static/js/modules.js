function deleteModule(id) {
    console.log("deleting " +id)

    $.post("/del", { id: id }, function(data) {
        console.log("Done")
        location.reload()
    });
}