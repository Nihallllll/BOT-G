import { octokitClient } from './client.js';
import { config } from '../config/env.js';
import { userQueries, contributionQueries, syncQueries, scoreQueries } from '../database/queries.js';
import { calculatePRScore, calculateReviewScore } from '../core/scoring.js';

export async function monitorPullRequests(repo: string) {
  const lastSync = await syncQueries.getLastSync(`prs:${repo}`);
  const since = lastSync || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  console.log(`Checking PRs in ${repo} since ${since.toISOString()}`);
  
  const { data: prs } = await octokitClient.rest.pulls.list({
    owner: config.github.org,
    repo,
    state: 'all',
    sort: 'updated',
    direction: 'desc',
    per_page: 100,
  });
  
  const recentPRs = prs.filter(pr => new Date(pr.updated_at) > since);
  console.log(`Found ${recentPRs.length} recent PRs`);
  
  for (const pr of recentPRs) {
    await processPullRequest(repo, pr);
  }
  
  await syncQueries.updateLastSync(`prs:${repo}`, new Date());
}

async function processPullRequest(repo: string, pr: any) {
  if (!pr.merged_at) return;
  
  const user = await userQueries.findByGithubUsername(pr.user.login);
  if (!user) return;
  
  const existing = await contributionQueries.findByGithubId('pr', repo, pr.number);
  if (existing) return;
  
  const points = calculatePRScore(pr);
  
  await contributionQueries.create({
    userId: user.id,
    type: 'pr',
    repoName: repo,
    githubId: pr.number,
    points,
    metadata: JSON.stringify({
      title: pr.title,
      additions: pr.additions,
      deletions: pr.deletions,
      files: pr.changed_files,
    }),
  });
  
  await scoreQueries.getOrCreate(user.id);
  await scoreQueries.updateScore(user.id, points, 'pr');
  
  console.log(`✅ Recorded PR #${pr.number} by ${pr.user.login} (+${points} pts)`);
}

export async function monitorCodeReviews(repo: string) {
  const lastSync = await syncQueries.getLastSync(`reviews:${repo}`);
  const since = lastSync || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  const { data: prs } = await octokitClient.rest.pulls.list({
    owner: config.github.org,
    repo,
    state: 'all',
    sort: 'updated',
    direction: 'desc',
    per_page: 50,
  });
  
  for (const pr of prs) {
    if (new Date(pr.updated_at) <= since) continue;
    
    const { data: reviews } = await octokitClient.rest.pulls.listReviews({
      owner: config.github.org,
      repo,
      pull_number: pr.number,
    });
    
    for (const review of reviews) {
      await processReview(repo, pr.number, review);
    }
  }
  
  await syncQueries.updateLastSync(`reviews:${repo}`, new Date());
}

async function processReview(repo: string, prNumber: number, review: any) {
  const user = await userQueries.findByGithubUsername(review.user.login);
  if (!user) return;
  
  const existing = await contributionQueries.findByGithubId('review', repo, review.id);
  if (existing) return;
  
  const points = calculateReviewScore(review);
  
  await contributionQueries.create({
    userId: user.id,
    type: 'review',
    repoName: repo,
    githubId: review.id,
    points,
    metadata: JSON.stringify({
      prNumber,
      state: review.state,
    }),
  });
  
  await scoreQueries.getOrCreate(user.id);
  await scoreQueries.updateScore(user.id, points, 'review');
  
  console.log(`✅ Recorded review by ${review.user.login} (+${points} pts)`);
}
