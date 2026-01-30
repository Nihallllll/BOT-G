import { contributionQueries, userQueries } from '../database/queries.js';
import type { RoleConfig } from '../config/roles.js';

export async function checkRoleCriteria(userId: number, criteria: RoleConfig['criteria']): Promise<boolean> {
  if (criteria.must_have) {
    for (const [condition, value] of Object.entries(criteria.must_have)) {
      const met = await checkCondition(userId, condition, value);
      if (!met) return false;
    }
  }
  
  if (criteria.any_of) {
    let anyMet = false;
    for (const [condition, value] of Object.entries(criteria.any_of)) {
      const met = await checkCondition(userId, condition, value);
      if (met) {
        anyMet = true;
        break;
      }
    }
    if (!anyMet) return false;
  }
  
  return true;
}

async function checkCondition(userId: number, condition: string, value: any): Promise<boolean> {
  const user = await userQueries.findByDiscordId((await import('../database/client.js')).prisma.user.findUnique({ where: { id: userId } }).then(( u :any) => u?.discordId || ''));
  
  switch (condition) {
    case 'linked_github': {
      const u = await (await import('../database/client.js')).prisma.user.findUnique({ where: { id: userId } });
      return !!u?.githubUsername;
    }
    
    case 'min_merged_prs': {
      const count = await contributionQueries.countByUser(userId, 'pr');
      return count >= value;
    }
    
    case 'merged_prs_last_90_days': {
      const since = new Date();
      since.setDate(since.getDate() - 90);
      const recent = await contributionQueries.countSince(userId, 'pr', since);
      return recent >= value;
    }
    
    case 'reviews_last_90_days': {
      const since = new Date();
      since.setDate(since.getDate() - 90);
      const recent = await contributionQueries.countSince(userId, 'review', since);
      return recent >= value;
    }
    
    case 'total_merged_prs': {
      const count = await contributionQueries.countByUser(userId, 'pr');
      return count >= value;
    }
    
    default:
      console.warn(`Unknown condition: ${condition}`);
      return false;
  }
}

export async function checkRemoveCriteria(userId: number, criteria: Record<string, any>): Promise<boolean> {
  for (const [condition, value] of Object.entries(criteria)) {
    const met = await checkCondition(userId, condition, value);
    if (met) return true;
  }
  return false;
}
