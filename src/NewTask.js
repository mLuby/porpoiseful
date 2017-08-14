import React from 'react';
import db from "./firebase.js"
import {compose, withState, withHandlers} from "recompose"

function createTaskFromString(taskString) {
  const task = parseTaskString(taskString)
  console.log("new task", task)
  db.ref('tasks/' + task.title).set(task)
}

const NewTask = props => (
  <form onSubmit={props.onSubmit}>
    <label>New Task:
      <input type="text" placeholder="new task" value={props.taskString} onChange={props.onChange} />
    </label>
  </form>
)

export default compose(
  withState('taskString', 'setTaskString', '.title. foo bar .due.baz'),
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
  return kvTuples.reduce((acc, item) => merge(acc, {[item[0]]: item[1]}), {})
}

function merge (obj1, obj2) {
  return Object.assign({}, obj1, obj2)
}
