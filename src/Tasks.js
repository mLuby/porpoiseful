import React, {Component} from 'react';
import {db} from "./firebase.js"
import moment from "moment"

class Tasks extends Component {
  constructor (props) {
    super(props)
    this.state = {tasks: [], filter: t=>t, sort: () => -1}

    this.setTasks = this.setTasks.bind(this)
    this.filterCompletedTasks = this.filterCompletedTasks.bind(this)
    this.filterUncompletedTasks = this.filterUncompletedTasks.bind(this)
    this.toggleComplete = this.toggleComplete.bind(this)
  }

  setTasks (tasks) {
    this.setState({tasks})
  }

  filterCompletedTasks () {
    console.log("filter completed tasks…")
    this.setState({
      filter: t => t.completedAt,
      sort: (t1, t2) => t1.completedAt > t2.completedAt ? -1 : 1,
    })
  }

  filterUncompletedTasks () {
    console.log("filter uncompleted tasks…")
    this.setState({
      filter: t => !t.completedAt,
      sort: (t1, t2) => t1.createdAt > t2.createdAt ? -1 : 1,
    })
  }

  toggleComplete (task) {
    return () => {
      task.completedAt = task.completedAt ? null : (new Date()).toISOString()
      console.log(`${task.completedAt ? "" : "un"}completing '${task.title}'`)
      db.ref('/tasks/'+task.id).set(task)
    }
  }

  componentWillMount() {
    console.log("loading tasks…")
    this.filterUncompletedTasks()
    db.ref('/tasks').on('value', snapshot => {
      const tasksObj = snapshot.val() || {} // when no tasks it's null
      const tasks = Object.keys(tasksObj).map(k => Object.assign(tasksObj[k], {id: k}))
      console.log("loaded tasks.")
      return this.setTasks(tasks)
    })
  }

  render () { return (
    <section className="TaskList">
      <div className="controls">
        <button onClick={this.filterCompletedTasks}>Completed</button>
        <button onClick={this.filterUncompletedTasks}>Uncompleted</button>
      </div>
      <ul>
        {this.state.tasks.filter(this.state.filter).sort(this.state.sort).map(task => (
          <li className={`Task${task.completedAt?" completed":""}`} title={task.id} key={task.id}>
            <input type="checkbox" checked={task.completedAt} onClick={this.toggleComplete(task)} />
            {task.title && <span className="title">{task.title}</span>}
            {task.completedAt && <span className="completedAt">{moment(task.completedAt).fromNow()}</span>}
            {task.createdAt && <span className="createdAt">{moment(task.createdAt).fromNow()}</span>}
          </li>
        ))}
      </ul>
    </section>
  )}
}

export default Tasks
