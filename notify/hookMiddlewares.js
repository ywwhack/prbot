const { PULL_REQUEST, PULL_REQUEST_REVIEW, ISSUE_COMMENT } = require('./constants/events')
const { binding } = require('./bootstrap/binding')
const MessageQueue = require('./lib/MessageQueue')

const { createIfNotExist } = require('../share/utils')
const { USERS_PATH } = require('../share/paths')
const { promisify } = require('util')
const fs = require('fs')

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
  // 只有 state 不是 pedding，并且不是自己的评论才会转发
  if (state !== 'pedding' && proposer !== owner && notify) {
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
async function canNotify (user) {
  // TODO: 使用数据库存储
  const usersModel = JSON.parse(await promisify(fs.readFile)(USERS_PATH))
  if (usersModel[user]) {
    const { state, time: [ start, end ] } = usersModel[user].notify
    const currentHour = new Date().getHours()
    if (!state) {
      // 不开启通知
      return false
    } else if (currentHour < parseInt(start) || currentHour > parseInt(end)) {
      // 不在通知时段内
      return false
    } else {
      return true
    }
  } else {
    return true
  }
}

module.exports = [
  [PULL_REQUEST, processPullRequest],
  [PULL_REQUEST_REVIEW, processPullRequestReview],
  [ISSUE_COMMENT, processIssueComment]
]
