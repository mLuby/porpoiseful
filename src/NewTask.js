import React from 'react';
import {db} from "./firebase.js"
import {compose, withState, withHandlers} from "recompose"

function createTaskFromString (taskString) {
  if (taskString === "") return
  const task = parseTaskString(taskString)
  task.createdAt = task.createdAt || (new Date()).toISOString()
  task.modifiedAt = task.modifiedAt || (new Date()).toISOString()
  if (task.id) {
    db.ref('/tasks/'+task.id).set(task)
  } else {
    db.ref('/tasks').push(task)
  }
}

const NewTask = props => (
  <form className="NewTask" onSubmit={props.onSubmit} action="#">
    <input type="text" placeholder="New task…" value={props.taskString} onChange={props.onChange} />
  </form>
)

export default compose(
  withState('taskString', 'setTaskString', ''),
  withHandlers({
    onChange: props => event => props.setTaskString(event.target.value),
    onSubmit: props => event => {
      props.setTaskString("")
      event.preventDefault()
      createTaskFromString(props.taskString)
    }
  })
)(NewTask)

function parseTaskString (taskString) {
  const taskStringN = taskString+"\n" // so regex catches last term
  const taskStringToKvPairs = /(?:\.([a-z]+)\.(.+?)(?=(?:\.[a-z]+\.)|\n))/g
  const kvPair = /^\.([a-z]+)\.(.+)$/
  const matches = taskStringN.match(taskStringToKvPairs) || [".title."+taskString] // if no keys, use string as title
  const kvTuples = matches.map(m => m.match(kvPair).slice(1).map(s => s.trim()))
  const task = kvTuples.reduce((acc, item) => merge(acc, {[item[0]]: item[1]}), {})
  return task
}

function merge (obj1, obj2) {
  return Object.assign({}, obj1, obj2)
}
