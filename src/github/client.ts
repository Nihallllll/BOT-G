import { Octokit } from 'octokit';
import { config } from '../config/env';

export const octokitClient = new Octokit({
  auth: config.github.token,
});

// Helper to check rate limit
export async function getRateLimit() {
  const { data } = await octokitClient.rest.rateLimit.get();
  return data.rate;
}