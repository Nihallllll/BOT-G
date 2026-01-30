import { Octokit } from 'octokit';
import { config } from '../config/env.js';

export const octokitClient = new Octokit({
  auth: config.github.token,
});

export async function getRateLimit() {
  const { data } = await octokitClient.rest.rateLimit.get();
  return data.rate;
}

export async function verifyGithubUsername(username: string): Promise<boolean> {
  try {
    await octokitClient.rest.users.getByUsername({ username });
    return true;
  } catch (error) {
    return false;
  }
}
