const issueModel = require('../models/issueModel');

const getIssueList = async () => {
  try {
    let issueList = await issueModel.getIssueList();
    const promiseList = [];
    issueList.forEach((issue) => {
      const label = issueModel.getIssueLabel(issue.id);
      const assignee = issueModel.getIssueAssignee(issue.id);
      promiseList.push(label);
      promiseList.push(assignee);
    });

    await Promise.all(promiseList).then((item) => {
      let index = -2;
      issueList = issueList.map((issue) => {
        index += 2;
        return { ...issue, label: item[index], assignee: item[index + 1] };
      });
    });

    return issueList;
  } catch (err) {
    return undefined;
  }
};

const getIssueDetail = async (id) => {
  try {
    const optionName = ['label', 'assignee', 'comment', 'ratio'];
    const issue = await issueModel.getIssueDetail(id);
    const option = await Promise.all([
      issueModel.getIssueLabel(id),
      issueModel.getIssueAssignee(id),
      issueModel.getIssueComment(id),
      issueModel.getIssueRatio(id),
    ]);
    option.forEach((item, index) => {
      issue[optionName[index]] = item;
    });
    return issue;
  } catch (err) {
    return undefined;
  }
};

const createIssue = async (issueInfo) => {
  try {
    const issueId = await issueModel.createIssue(issueInfo);
    const { assignees, labels } = issueInfo;
    const promiseList = [];

    labels.forEach((labelId) => {
      promiseList.push(issueModel.createIssueHasLbel(issueId, labelId));
    })

    assignees.forEach((assigneeId) => {
      promiseList.push(issueModel.createAssignee(assigneeId, issueId));
    })

    await Promise.all(promiseList);
    return issueId;
  } catch (err) {
    return undefined;
  }
};

const stateChange = async (state, id) => {
  try {
    state = state === 1 ? 0 : 1;
    const issue = await issueModel.stateChange(state, id);

    return issue;
  } catch (err) {
    return undefined;
  }
};

const titleUpdate = async (id, title) => {
  try {
    const issue = await issueModel.titleUpdate(id, title);

    return issue;
  } catch (err) {
    return undefined;
  }
};

module.exports = {
  getIssueList,
  getIssueDetail,
  createIssue,
  stateChange,
  titleUpdate,
};
