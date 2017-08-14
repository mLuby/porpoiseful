const csv = require("csvtojson")
const {db} = require("./firebase.js")

module.exports = parseCsv

if (process.argv[2]) {
  importAsana(process.argv[2])
}

function importAsana(csvPath) {
  console.log("Parsing", csvPath, "…")
  return parseCsv(csvPath, (error, importedTasks) => {
    if (error) throw error
    console.log("Parsed. Translating", importedTasks.length, "tasks…")
    const newTasks = []
    importedTasks.forEach(importedTask => {
      const newTask = {
        externalId: importedTask["Task ID"],
        createdAt: importedTask["Created At"],
        completedAt: importedTask["Completed At"],
        modifiedAt: importedTask["Last Modified"],
        title: importedTask["Name"],
        assignee: importedTask["Assignee"],
        due: importedTask["Due Date"],
        // tags: importedTask["Tags"], // always empty, probably csv.
        notes: importedTask["Notes"],
        tags: importedTask["Projects"], // csv
        parent: importedTask["Parent Task"],
      }
      if (!newTask.title) {
        console.warn("malformed importedTask", importedTask, "newTask", newTask)
      } else {
        newTasks.push(newTask)
      }
    })
    console.log("Translated. Uploading", importedTasks.length, "tasks…")
    return uploadToDb(newTasks).then(okErrors => console.log(
      okErrors.filter(x=>!x.error).length,
      "uploaded",
      okErrors.filter(x=>x.error).length,
      "errored"
    ))
  })
}

function parseCsv (csvPath, callback) {
  var csvData = []
  var firstRead = true
  csv()
  .fromFile(csvPath)
  .on("json", function (row) {
    if (firstRead) {
      firstRead = false // Only do this the first time.
      console.log("[parseCsv] headers are", Object.keys(row).join(", "))
    }
    csvData.push(row)
  })
  .on("done", function (error) {
    console.log("[parseCsv] parsed", csvData.length, "rows")
    callback(error, csvData)
  })
}

function uploadToDb (tasks) {
  return Promise.all(tasks.map(task => new Promise((resolve, reject) => {
    try {
      return db.ref('/tasks').push(task).then(() => (console.log(`uploaded '${task.title}'`), resolve({task})))
    } catch (error) {
      console.log("Failed to upload task:", task)
      console.error(error.message)
      return resolve({error, task})
    }
  })))
}
