const { filehelperMsgQueue, dtMsgQueue, userMsgQueueMap } = require('./bootstrap/messageQueues')
const { PULL_REQUEST, PULL_REQUEST_REVIEW } = require('./constants/events')

function processPullRequest (eventName, payload, wechatBot) {
  if (eventName === PULL_REQUEST) {
    if (payload.action === 'opened') {
      const prData = payload.pull_request
      filehelperMsgQueue.send(`${prData.head.repo.name}：${prData.html_url}`)
    }
  }
}

function processPullRequestReview (eventName, payload, wechatBot) {
  if (eventName === PULL_REQUEST_REVIEW) {
    const { review, pull_request } = payload
    const body = review.body
    const notifierMsgQueue = userMsgQueueMap[pull_request.user.login]
    // 被通知的人必须要存在机械人的好友中
    // 并且 pull_request_review 值不为空
    if (body && notifierMsgQueue) {
      notifierMsgQueue.send(`${review.user.login}：${body}`)
    }
  }
}

module.exports = [
  [PULL_REQUEST, processPullRequest],
  [PULL_REQUEST_REVIEW, processPullRequestReview]
]
