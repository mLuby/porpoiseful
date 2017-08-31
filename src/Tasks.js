import React, {Component} from 'react';
import {db} from "./firebase.js"
import Task from "./Task.js"
import moment from "moment"

const CHECK_SNOOZE_MS = 1000

class Tasks extends Component {
  constructor (props) {
    super(props)
    this.state = {tasks: [], filter: t=>t, sort: () => -1}

    this.setTasks = this.setTasks.bind(this)
    this.filterSnoozeTasks = this.filterSnoozeTasks.bind(this)
    this.filterCompletedTasks = this.filterCompletedTasks.bind(this)
    this.filterActiveTasks = this.filterActiveTasks.bind(this)
  }

  setTasks (tasks) {
    this.setState({tasks})
  }

  filterSnoozeTasks () {
    console.log("filter snoozed tasks…")
    this.setState({
      filter: t => t.snoozeTill,
      sort: (t1, t2) => t1.snoozeTill > t2.snoozeTill ? -1 : 1,
    })
  }

  filterCompletedTasks () {
    console.log("filter completed tasks…")
    this.setState({
      filter: t => t.completedAt,
      sort: (t1, t2) => t1.completedAt > t2.completedAt ? -1 : 1,
    })
  }

  filterActiveTasks () {
    console.log("filter active tasks…")
    this.setState({
      filter: t => !t.completedAt && !t.snoozeTill,
      sort: (t1, t2) => (t1.modifiedAt || t1.createdAt) > (t2.modifiedAt || t2.createdAt) ? -1 : 1,
    })
  }

  componentWillMount() {
    console.log("loading tasks…")
    this.filterActiveTasks()
    db.ref('/tasks').on('value', snapshot => {
      const tasksObj = snapshot.val() || {} // when no tasks it's null
      const tasks = Object.keys(tasksObj).map(k => Object.assign(tasksObj[k], {id: k}))
      console.log(now(), "(re)loaded tasks.")
      return this.setTasks(tasks)
    })

    setInterval(checkSnooze.bind(this), CHECK_SNOOZE_MS)
    function checkSnooze () {
      this.state.tasks.forEach(task => {
        if (task.snoozeTill < now()) {
          db.ref(`tasks/${task.id}/snoozeTill`).remove().then(() => console.log(`unsnoozed ${task.id}:${task.title} ${task.snoozeTill} < ${now()}`)).catch(error => console.error(`failed to unsnooze ${task.id}:${task.title}`, error))
          db.ref("tasks/"+task.id+"/modifiedAt").set(now())
        }
      })
    }
  }

  render () {
    return (
    <section className="TaskList">
      <div className="controls">
        <button onClick={this.filterSnoozeTasks}>Snoozed</button>
        <button onClick={this.filterActiveTasks}>Active</button>
        <button onClick={this.filterCompletedTasks}>Completed</button>
      </div>
      {this.state.tasks.filter(this.state.filter).sort(this.state.sort).map(task => (
        <Task task={task} key={task.id}/>
      ))}
    </section>
  )}
}

function now () { return moment().format() }

export default Tasks
