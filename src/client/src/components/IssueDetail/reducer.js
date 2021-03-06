import IssueDetailAction from './action';
import issueAPI from '../../util/api/issue';
import commentAPI from '../../util/api/comment';
import milestoneAPI from '../../util/api/milestone';

// Promise
function getMilestoneRation(state, action) {
  const { milestone } = state;
  const { dispatch } = action;
  milestoneAPI.getMilestoneRatio(milestone.id).then((data) => {
    if (data) {
      dispatch({
        type: IssueDetailAction.SET_MILESTONE_RATIO,
        ratio: data.ratio,
      });
    }
  });
  return state;
}

function changeIssueState(state, action) {
  const { issue } = state;
  const { state: issueState, dispatch } = action;
  issueAPI
    .changeIssueState(issue.id, issueState ? 'Open' : 'Close')
    .then((status) => {
      if (status === 200)
        dispatch({
          type: IssueDetailAction.SET_ISSUE_STATE,
          issueState,
        });
      dispatch({ type: IssueDetailAction.GET_MILESTONE_RATIO, dispatch });
    });
  return state;
}

function createComment(state, action) {
  const { issue } = state;
  const { user, content, dispatch } = action;
  if (!(user && content && issue)) return state;
  commentAPI
    .createComment({ issueId: issue.id, userId: user.userId, content })
    .then(({ comment }) => {
      if (comment) {
        dispatch({
          type: IssueDetailAction.ADD_COMMENT,
          comment,
        });
      }
    });
  return state;
}

function updateCommentContent(state, action) {
  const { issue } = state;
  const { id: commentId, content, dispatch } = action;
  if (!content) return state;
  commentAPI
    .updateCommentContent({ commentId, issueId: issue.id, content })
    .then((status) => {
      if (status === 205)
        dispatch({
          type: IssueDetailAction.SET_COMMENT_CONTENT,
          commentId,
          content,
        });
    });
  return state;
}

function updateIssueContent(state, action) {
  const { id, content, dispatch } = action;
  if (!content) return state;
  issueAPI.updateIssueContent(id, content).then((status) => {
    if (status === 200)
      dispatch({ type: IssueDetailAction.SET_ISSUE_CONTENT, content });
  });
  return state;
}

function updateIssueTitle(state, action) {
  const { issue } = state;
  const { value, dispatch } = action;
  if (!value) return state;
  issueAPI.updateIssueTitle(issue.id, value).then((status) => {
    if (status === 200)
      dispatch({ type: IssueDetailAction.SET_ISSUE_TITLE, title: value });
  });
  return state;
}

function updateAssigneeList(state, action) {
  const { issue, assignee: assignees } = state;
  const { assignee: newAssignee, dispatch } = action;
  if (
    newAssignee &&
    assignees.find((assignee) => newAssignee.id === assignee.id)
  )
    return state;
  const newAssigneeList = newAssignee ? [...assignees, newAssignee] : [];
  issueAPI
    .updateAssigneeList(
      issue.id,
      newAssigneeList.map((data) => data.id),
    )
    .then((status) => {
      if (status === 200)
        dispatch({
          type: IssueDetailAction.SET_ASSIGNEE_LIST,
          assignee: newAssigneeList,
        });
    });
  return state;
}

function updateLabelList(state, action) {
  const { issue, label: labels } = state;
  const { label: newLabel, dispatch } = action;
  if (newLabel && labels.find((label) => newLabel.id === label.id))
    return state;

  const newLabelList = newLabel ? [...labels, newLabel] : [];
  issueAPI
    .updateLabelList(
      issue.id,
      newLabelList.map((data) => data.id),
    )
    .then((status) => {
      if (status === 200)
        dispatch({
          type: IssueDetailAction.SET_LABEL_LIST,
          label: newLabelList,
        });
    });
  return state;
}

function updateMilestone(state, action) {
  const { issue } = state;
  const { milestone, dispatch } = action;
  issueAPI
    .updateMilestone(issue.id, milestone ? milestone.id : null)
    .then((data) => {
      if (!data) return;
      dispatch({
        type: IssueDetailAction.SET_MILESTONE,
        milestone: data[0],
      });
    });
  return state;
}

// Set state
function applyMilestone(state, action) {
  return {
    ...state,
    milestone: { ...action.milestone },
  };
}
function applyLabelList(state, action) {
  return {
    ...state,
    label: [...action.label],
  };
}
function applyAssigneeList(state, action) {
  return {
    ...state,
    assignee: [...action.assignee],
  };
}

function applyIssueTitle(state, action) {
  return {
    ...state,
    issue: {
      ...state.issue,
      title: action.title,
    },
  };
}

function applyIssueContent(state, action) {
  return {
    ...state,
    issue: {
      ...state.issue,
      content: action.content,
    },
  };
}

function applyCommentContent(state, action) {
  const newComments = state.comment.map((data) => {
    if (action.commentId === data.id) {
      return { ...data, content: action.content };
    }
    return { ...data };
  });
  return {
    ...state,
    comment: newComments,
  };
}

function applyComment(state, action) {
  const { comment: newComment } = action;
  return {
    ...state,
    comment: [...state.comment, newComment],
  };
}

function applyIssueState(state, action) {
  const { issueState } = action;
  return {
    ...state,
    issue: {
      ...state.issue,
      state: issueState,
    },
  };
}

function applyMilestoneRatio(state, action) {
  const { milestone } = state;
  const { ratio } = action;
  return {
    ...state,
    milestone: {
      ...milestone,
      ratio,
    },
  };
}

function reducer(state, action) {
  switch (action.type) {
    case IssueDetailAction.SET_MILESTONE:
      return applyMilestone(state, action);
    case IssueDetailAction.UPDATE_MILESTONE:
      return updateMilestone(state, action);
    case IssueDetailAction.UPDATE_LABEL_LIST:
      return updateLabelList(state, action);
    case IssueDetailAction.SET_LABEL_LIST:
      return applyLabelList(state, action);
    case IssueDetailAction.SET_ASSIGNEE_LIST:
      return applyAssigneeList(state, action);
    case IssueDetailAction.UPDATE_ASSIGNEE_LIST:
      return updateAssigneeList(state, action);
    case IssueDetailAction.UPDATE_ISSUE_TITLE:
      return updateIssueTitle(state, action);
    case IssueDetailAction.SET_ISSUE_TITLE:
      return applyIssueTitle(state, action);
    case IssueDetailAction.UPDATE_ISSUE_CONTENT:
      return updateIssueContent(state, action);
    case IssueDetailAction.SET_ISSUE_CONTENT:
      return applyIssueContent(state, action);
    case IssueDetailAction.UPDATE_COMMENT_CONTENT:
      return updateCommentContent(state, action);
    case IssueDetailAction.SET_COMMENT_CONTENT:
      return applyCommentContent(state, action);
    case IssueDetailAction.CREATE_COMMENT:
      return createComment(state, action);
    case IssueDetailAction.ADD_COMMENT:
      return applyComment(state, action);
    case IssueDetailAction.CHANGE_ISSUE_STATE:
      return changeIssueState(state, action);
    case IssueDetailAction.SET_ISSUE_STATE:
      return applyIssueState(state, action);
    case IssueDetailAction.GET_MILESTONE_RATIO:
      return getMilestoneRation(state, action);
    case IssueDetailAction.SET_MILESTONE_RATIO:
      return applyMilestoneRatio(state, action);

    default:
      return state;
  }
}

export default reducer;
