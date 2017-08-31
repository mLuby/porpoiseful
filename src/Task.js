import React from 'react'
import moment from "moment"
import {db} from "./firebase.js"
import {compose, withState, withHandlers} from "recompose"
import {Holdable} from "react-touch"

function Task (props) {
  if (props.editing) {
    return (
      <li className={`Task${props.task.completedAt?" completed":""}`} title={props.task.id}>
        <form className="editing" onSubmit={props.onTitleEditSubmit} action="#">
          <label><span className="icon" role="img" aria-label="editing" onClick={props.toggleEditing}>📝</span>
            <input type="text" value={props.editedTitle} onChange={props.onTitleEdit} autoFocus onBlur={props.toggleEditing}/>
          </label>
        </form>
      </li>
    )
  } else if (props.snoozing) {
    return (
      <li className="Task noSelect" title={props.task.id}>
        <span className="icon" role="img" aria-label="close" onClick={props.toggleSnoozing}>✖️</span>
        <select onBlur={props.toggleSnoozing} onChange={props.snooze}>
          <option value={"N/A"}>How long to snooze?</option>
          <option value={"15s"}>15s</option>
          <option value={"later today"}>Later (+3h)</option>
          <option value={"next morning"}>Next morning 9am</option>
          <option value={"next afternoon"}>Next afternoon (1pm)</option>
          <option value={"next evening"}>Next evening (7pm)</option>
          <option value={"next weekend"}>Weekend Fri 7pm</option>
          <option value={"next week"}>Next Monday 9am</option>
          <option value={"first of next month"}>First of the month 9am</option>
          <option value={"clear"}>Clear snooze</option>
        </select>
        <input type="datetime-local" onBlur={props.snooze}/>
      </li>
    )
  } else {
    const classes = [...new Set([
      "Task",
      props.task.completedAt && "completed",
      props.task.snoozeTill && "snoozed",
    ])].filter(Boolean).join(" ")
    return (
      <Holdable onHoldComplete={props.toggleSnoozing}>
      <li className={classes} title={props.task.id}>
        <div>
          <input type="checkbox" checked={props.task.completedAt} onClick={props.toggleComplete} />
          <span className="details" onClick={props.toggleEditing}>
            {props.task.title && <span className="title">{props.task.title}</span>}
            {props.task.completedAt && <span className="completedAt">{moment(props.task.completedAt).fromNow()}</span>}
            {props.task.createdAt && <span className="createdAt">{moment(props.task.createdAt).fromNow()}</span>}
          </span>
        </div>
      </li>
      </Holdable>
    )
  }
}

const snoozeOptionToDate = {
  "N/A": noop,
  "15s": date => moment(date).add(15, "seconds").format(),
  "later today": date => moment(date).add(3, "hours").format(),
  "next morning": date => moment(date).startOf("day").add({hours: 9, days: moment(date).hours() >= 9 ? 1 : 0}).format(),
  "next afternoon": date => moment(date).startOf("day").add({hours: 14, days: moment(date).hours() >= 14 ? 1 : 0}).format(),
  "next evening": date => moment(date).startOf("day").add({hours: 19, days: moment(date).hours() >= 19 ? 1 : 0}).format(),
  "next weekend": date => moment(date).add(moment(date).isoWeekday() >= 6 ? 1 : 0, "week").startOf("isoWeek").add(5, "days").add(9, "hours").format(),
  "next week": date => moment(date).add(1, "week").startOf("isoWeek").add(9, "hours").format(),
  "first of next month": date => moment(date).add(1, "month").startOf("month").add(9, "hours").format(),
  "clear": () => moment().format(),
}

export default compose(
  withState('editedTitle', 'setEditTitle', props => props.task.title),
  withState('editing', 'setEditing', false),
  withState('snoozing', 'setSnoozing', false),
  withHandlers({
    onTitleEdit: props => event => props.setEditTitle(event.target.value),
    onTitleEditSubmit: props => event => {
      event.preventDefault()
      props.setEditing(false)
      if (props.editedTitle === "") {
        db.ref("tasks/"+props.task.id).remove().then(() => console.log(`deleted ${props.task.id}:${props.task.title}`)).catch(error => console.error(`failed to delete ${props.task.id}:${props.task.title}`, error))
      } else {
        props.task.title = props.editedTitle
        db.ref("tasks/"+props.task.id).set(props.task).then(() => console.log(`${props.task.title} -> ${props.editedTitle}`)).catch(error => console.error(`failed to edit ${props.task.id}:${props.task.title} -> ${props.editedTitle}`, error))
        db.ref("tasks/"+props.task.id+"/modifiedAt").set(now())
      }
    },
    toggleEditing: props => () => {
      props.setEditing(!props.editing)
      props.setEditTitle(props.task.title)
    },
    toggleSnoozing: props => () => {
      props.setSnoozing(!props.snoozing)
    },
    snooze: props => event => {
      props.setSnoozing(false)
      const value = event.target.value
      const isDate = moment(value).isValid()
      const snoozeTill = isDate ? value : (snoozeOptionToDate[value] || noop)()
      if (!snoozeTill) return
      db.ref(`tasks/${props.task.id}/snoozeTill`).set(snoozeTill).then(() => console.log(`${(new Date()).toISOString()}: snoozed till ${snoozeTill} ${props.task.id}:${props.task.title}`)).catch(error => console.error(`failed to snooze ${props.task.id}:${props.task.title}`, error))
      db.ref("tasks/"+props.task.id+"/modifiedAt").set(now())
    },
    toggleComplete: props => () => {
      props.task.completedAt = props.task.completedAt ? null : moment().format()
      props.task.snoozeTill = null
      console.log(`${props.task.completedAt ? "" : "un"}completing '${props.task.title}'`)
      db.ref('/tasks/'+props.task.id).set(props.task)
      db.ref("tasks/"+props.task.id+"/modifiedAt").set(now())
    },
  })
)(Task)

function noop () { /* noop */}

function now () { return moment().format() }
