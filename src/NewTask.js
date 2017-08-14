import React from 'react';
import {db} from "./firebase.js"
import {compose, withState, withHandlers} from "recompose"

function createTaskFromString(taskString) {
  const task = parseTaskString(taskString)
  db.ref('/tasks').push(task)
}

const NewTask = props => (
  <form className="NewTask" onSubmit={props.onSubmit}>
    <input type="text" placeholder="New task…" value={props.taskString} onChange={props.onChange} />
  </form>
)

export default compose(
  withState('taskString', 'setTaskString', ''),
  withHandlers({
    onChange: props => event => props.setTaskString(event.target.value),
    onSubmit: props => event => {
      event.preventDefault()
      createTaskFromString(props.taskString)
    }
  })
)(NewTask)

function parseTaskString (taskString) {
  taskString += "\n" // so regex catches last term
  const taskStringToKvPairs = /(?:\.([a-z]+)\.(.+?)(?=(?:\.[a-z]+\.)|\n))/g
  const kvPair = /^\.([a-z]+)\.(.+)$/
  const matches = taskString.match(taskStringToKvPairs)
  const kvTuples = matches.map(m => m.match(kvPair).slice(1).map(s => s.trim()))
  const task = kvTuples.reduce((acc, item) => merge(acc, {[item[0]]: item[1]}), {})
  task.id = task.id |(task.title)
}

function merge (obj1, obj2) {
  return Object.assign({}, obj1, obj2)
}
