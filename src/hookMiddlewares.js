const { PULL_REQUEST, PULL_REQUEST_REVIEW, PULL_REQUEST_REVIEW_COMMENT, ISSUE_COMMENT } = require('./constants/events')
const { binding } = require('./bootstrap/binding')
const MessageQueue = require('./lib/MessageQueue')

function processPullRequest (payload, wechatBot) {
  if (payload.action === 'opened') {
    const prData = payload.pull_request
    const group = binding[payload.repository.name]
    if (group) {
      MessageQueue.send(
        payload.pull_request.user.login 
        + ' has open a pull request in '
        + payload.repository.name
        + ', see: ' + payload.pull_request.html_url,
      group)
    }
  }
}

module.exports = [
  [PULL_REQUEST, processPullRequest]
  // [PULL_REQUEST_REVIEW, processPullRequestReview],
  // [PULL_REQUEST_REVIEW_COMMENT, processPullRequestReviewComment],
  // [ISSUE_COMMENT, processIssueComment]
]
