const { PULL_REQUEST, PULL_REQUEST_REVIEW, ISSUE_COMMENT } = require('./constants/events')
const { binding } = require('./bootstrap/binding')
const MessageQueue = require('./lib/MessageQueue')

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

function processPullRequestReview (payload, wechatBot) {
  const { review, pull_request } = payload
  const { state, user: { login: proposer } } = review
  const owner = pull_request.user.login
  // 只有 state 不是 pedding，并且不是自己的评论才会转发
  if (state !== 'pedding' && proposer !== owner) {
    MessageQueue.send(
      proposer + ' has ' + state + ' on ' + payload.repository.name 
      + ', see: ' + review.html_url,
    owner)
  }
}

function processIssueComment (payload, wechatBot) {
  const { comment, issue } = payload
  const { title, user: { login: owner } } = issue
  const proposer = comment.user.login
  if (proposer !== owner) {
    MessageQueue.send(
      proposer + ' has comment on ' + payload.repository.name + '\'s issue'
      + ', see: ' + comment.html_url,
    owner)
  }
}

module.exports = [
  [PULL_REQUEST, processPullRequest],
  [PULL_REQUEST_REVIEW, processPullRequestReview],
  [ISSUE_COMMENT, processIssueComment]
]
