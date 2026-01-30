import { octokitClient } from './client.js';
import { config } from '../config/env';

export async function findIssuesByLabels(labels: string[]) {
  const allIssues: any[] = [];
  
  // Search across org
  const query = `org:${config.github.org} is:open is:issue ${labels.map(l => `label:"${l}"`).join(' ')} no:assignee`;
  
  const { data } = await octokitClient.rest.search.issuesAndPullRequests({
    q: query,
    per_page: 20,
  });
  
  return data.items.filter(item => !item.pull_request);
}

export async function getIssue(repo: string, issueNumber: number) {
  const { data } = await octokitClient.rest.issues.get({
    owner: config.github.org,
    repo,
    issue_number: issueNumber,
  });
  return data;
}

export async function assignIssue(repo: string, issueNumber: number, username: string) {
  await octokitClient.rest.issues.addAssignees({
    owner: config.github.org,
    repo,
    issue_number: issueNumber,
    assignees: [username],
  });
}

export async function unassignIssue(repo: string, issueNumber: number, username: string) {
  await octokitClient.rest.issues.removeAssignees({
    owner: config.github.org,
    repo,
    issue_number: issueNumber,
    assignees: [username],
  });
}

export async function listIssuesForRepo(repo: string, labels?: string) {
  const { data } = await octokitClient.rest.issues.listForRepo({
    owner: config.github.org,
    repo,
    state: 'open',
    labels,
    per_page: 100,
  });
  
  return data.filter(issue => !issue.pull_request);
}
