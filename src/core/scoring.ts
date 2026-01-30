import { loadScoringConfig } from '../config/scoring.js';
import { contributionQueries } from '../database/queries.js';

export function calculatePRScore(pr: any): number {
  const config = loadScoringConfig().pull_request;
  
  let score = config.base;
  
  const linesChanged = (pr.additions || 0) + (pr.deletions || 0);
  const sizeScore = Math.min(linesChanged * config.per_line, config.max_size_bonus);
  score += sizeScore;
  
  const complexityScore = (pr.changed_files || 0) * config.per_file;
  score += complexityScore;
  
  const multiplier = getLabelMultiplier(pr.labels || [], config.multipliers);
  score *= multiplier;
  
  score = Math.max(config.caps.min_points, score);
  score = Math.min(config.caps.max_points, score);
  
  return Math.round(score);
}

function getLabelMultiplier(labels: any[], multipliers: Record<string, number>): number {
  for (const label of labels) {
    const labelName = typeof label === 'string' ? label : label.name;
    if (labelName in multipliers) {
      return multipliers[labelName]!;
    }
  }
  return 1.0;
}

export function calculateReviewScore(review: any): number {
  const config = loadScoringConfig().code_review;
  
  let score = config.base;
  
  if (review.body && review.body.length > 100) {
    score += config.detailed_feedback_bonus;
  }
  
  if (review.state === 'CHANGES_REQUESTED') {
    score += config.changes_requested;
  }
  
  return score;
}

export function calculateIssueScore(issue: any, action: 'created' | 'closed'): number {
  const config = loadScoringConfig().issue;
  
  let score = action === 'created' ? config.created : config.closed;
  
  if (action === 'created' && isWellDocumented(issue)) {
    score += config.well_documented_bonus;
  }
  
  return score;
}

function isWellDocumented(issue: any): boolean {
  const body = issue.body || '';
  
  const hasSteps = body.toLowerCase().includes('steps to reproduce');
  const hasExpected = body.toLowerCase().includes('expected');
  const hasActual = body.toLowerCase().includes('actual');
  
  return hasSteps || hasExpected || hasActual;
}
