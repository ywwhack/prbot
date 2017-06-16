const { filehelperMsgQueue, groupsQueueMap, userMsgQueueMap } = require('./bootstrap/messageQueues')
const { PULL_REQUEST, PULL_REQUEST_REVIEW, PULL_REQUEST_REVIEW_COMMENT, ISSUE_COMMENT } = require('./constants/events')
const { binding } = require('./bootstrap/binding')

function processPullRequest (eventName, payload, wechatBot) {
  if (eventName === PULL_REQUEST) {
    if (payload.action === 'opened') {
      const prData = payload.pull_request
      const group = binding[payload.repository.name]
      if (group && groupsQueueMap[group]) {
        groupsQueueMap[group].send(`${prData.head.repo.name}：${prData.html_url}`)
      }
    }
  }
}

function processPullRequestReview (eventName, payload, wechatBot) {
  if (eventName === PULL_REQUEST_REVIEW) {
    const { review, pull_request, repository } = payload
    send({
      from: review,
      to: pull_request,
      wechatBot,
      repository
    })
  }
}

function processPullRequestReviewComment (eventName, payload, wechatBot) {
  if (eventName === PULL_REQUEST_REVIEW_COMMENT) {
    const { comment, pull_request, repository } = payload
    send({
      from: comment,
      to: pull_request,
      wechatBot,
      repository
    })
  }
}

function processIssueComment (eventName, payload, wechatBot) {
  if (eventName === ISSUE_COMMENT) {
    const { issue, comment, repository } = payload
    send({
      from: comment,
      to: issue,
      wechatBot,
      repository
    })
  }
}

// util functions
function send ({ from, to, wechatBot, message, repository }) {
  const body = from.body
  const notifierMsgQueue = userMsgQueueMap[to.user.login]
  // 被通知的人必须要存在机械人的好友中
  // 并且 pull_request_review 值不为空
  if (body && notifierMsgQueue) {
    const msg = message || `${repository.name} 有一条来自 ${from.user.login} 的新评论：${ body.length > 20 ? body.slice(0, 17) + '...' : body }\n点击查看 ${from.html_url}`
    notifierMsgQueue.send(msg)
  }
}

module.exports = [
  [PULL_REQUEST, processPullRequest],
  [PULL_REQUEST_REVIEW, processPullRequestReview],
  [PULL_REQUEST_REVIEW_COMMENT, processPullRequestReviewComment],
  [ISSUE_COMMENT, processIssueComment]
]
