import { getAllRepositories } from '../github/repositories.js';
import { monitorPullRequests, monitorCodeReviews } from '../github/monitor.js';
import { getRateLimit } from '../github/client.js';
import { scoreQueries } from '../database/queries.js';
import { syncAllRoles } from './roles.js';

export async function runMonitoring() {
  console.log('🔍 Starting GitHub activity monitoring...');
  const startTime = Date.now();
  
  try {
    const repos = await getAllRepositories();
    console.log(`Monitoring ${repos.length} repositories`);
    
    for (const repo of repos) {
      try {
        console.log(`\n📦 Processing ${repo.name}...`);
        
        await monitorPullRequests(repo.name);
        await monitorCodeReviews(repo.name);
        
      } catch (error) {
        console.error(`❌ Error monitoring ${repo.name}:`, error);
      }
    }
    
    console.log('\n📊 Recalculating ranks...');
    await scoreQueries.recalculateRanks();
    
    console.log('\n👥 Syncing roles...');
    await syncAllRoles();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Monitoring complete in ${duration}s`);
    
    const rateLimit = await getRateLimit();
    console.log(`📊 Rate limit: ${rateLimit.remaining}/${rateLimit.limit}`);
    
  } catch (error) {
    console.error('❌ Fatal error in monitoring:', error);
    throw error;
  }
}
