import { octokitClient } from './client.js';
import { config } from '../config/env.js';

export async function getAllRepositories() {
  const repos: any[] = [];
  
  const iterator = octokitClient.paginate.iterator(
    octokitClient.rest.repos.listForOrg,
    { org: config.github.org, per_page: 100 }
  );
  
  for await (const { data } of iterator) {
    repos.push(...data);
  }
  
  return repos;
}

export async function getRepository(repo: string) {
  const { data } = await octokitClient.rest.repos.get({
    owner: config.github.org,
    repo,
  });
  return data;
}
