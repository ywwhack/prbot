const { PULL_REQUEST, PULL_REQUEST_REVIEW, ISSUE_COMMENT } = require('./constants/events')
const { binding } = require('./bootstrap/binding')
const MessageQueue = require('./lib/MessageQueue')

// Model
const User = require('../model/User')

function processPullRequest (payload, wechatBot) {
  const allowedActions = ['opened', 'synchronize']
  const action = allowedActions.find(i => i === payload.action)
  if (action) {
    const prData = payload.pull_request
    const group = binding[payload.repository.name]
    if (group) {
      MessageQueue.send(
        payload.pull_request.user.login 
        + ' has ' + action + ' a pull request in '
        + payload.repository.name
        + ', see: ' + payload.pull_request.html_url,
      group)
    }
  }
}

async function processPullRequestReview (payload, wechatBot) {
  const { review, pull_request } = payload
  const { state, user: { login: proposer } } = review
  const owner = pull_request.user.login
  const notify = await canNotify(owner)
  // 只有 state 不是 pending，并且不是自己的评论才会转发
  if (state !== 'pending' && proposer !== owner && notify) {
    MessageQueue.send(
      proposer + ' has ' + state + ' on ' + payload.repository.name 
      + ', see: ' + review.html_url,
    owner)
  }
}

async function processIssueComment (payload, wechatBot) {
  const { comment, issue } = payload
  const { title, user: { login: owner } } = issue
  const proposer = comment.user.login
  const notify = await canNotify(owner)
  if (proposer !== owner && notify) {
    MessageQueue.send(
      proposer + ' has comment on ' + payload.repository.name + '\'s issue'
      + ', see: ' + comment.html_url,
    owner)
  }
}

// 根据用户的通知设置（是否开启通知／通知时段），判断此时是否发送通知
async function canNotify (name) {
  try {
    const user = (await User.findOne({ name })).toJSON()
    const { state, time: [ start, end ] } = user.notify
    const currentHour = new Date().getHours()
    if (state && currentHour >= parseInt(start) && currentHour < parseInt(end)) {
      return true
    } else {
      return false
    }
  } catch (e) {
    console.log('notify error: ', e)
    return true
  }
}

module.exports = [
  [PULL_REQUEST, processPullRequest],
  [PULL_REQUEST_REVIEW, processPullRequestReview],
  [ISSUE_COMMENT, processIssueComment]
]
