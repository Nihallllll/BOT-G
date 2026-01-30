import { loadRoleConfig } from '../config/roles.js';
import { checkRoleCriteria, checkRemoveCriteria } from './role-checker.js';
import { discordClient } from '../discord/client.js';
import { config } from '../config/env.js';
import { EmbedBuilder } from 'discord.js';

export async function syncUserRoles(userId: number, discordId: string) {
  const roles = loadRoleConfig();
  const guild = await discordClient.guilds.fetch(config.discord.guildId);
  const member = await guild.members.fetch(discordId);
  
  const rolesToAdd: string[] = [];
  const rolesToRemove: string[] = [];
  
  for (const [roleKey, roleConfig] of Object.entries(roles)) {
    const shouldHave = await checkRoleCriteria(userId, roleConfig.criteria);
    const currentlyHas = member.roles.cache.has(roleConfig.discord_role_id);
    
    if (shouldHave && !currentlyHas) {
      rolesToAdd.push(roleConfig.discord_role_id);
    } else if (!shouldHave && currentlyHas) {
      if (roleConfig.remove_if) {
        const shouldRemove = await checkRemoveCriteria(userId, roleConfig.remove_if);
        if (shouldRemove) {
          rolesToRemove.push(roleConfig.discord_role_id);
        }
      }
    }
  }
  
  for (const roleId of rolesToAdd) {
    const role = guild.roles.cache.get(roleId);
    if (role) {
      await member.roles.add(role);
      console.log(`✅ Added ${role.name} to user ${discordId}`);
      await notifyRoleGranted(discordId, role.name);
    }
  }
  
  for (const roleId of rolesToRemove) {
    const role = guild.roles.cache.get(roleId);
    if (role) {
      await member.roles.remove(role);
      console.log(`➖ Removed ${role.name} from user ${discordId}`);
    }
  }
}

async function notifyRoleGranted(discordId: string, roleName: string) {
  try {
    const user = await discordClient.users.fetch(discordId);
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎉 New Role Unlocked!')
      .setDescription(`Congratulations! You've earned the **${roleName}** role!`)
      .setTimestamp();
    
    await user.send({ embeds: [embed] });
  } catch (error) {
    console.log(`Could not DM user ${discordId}`);
  }
}

export async function syncAllRoles() {
  console.log('🔄 Syncing roles for all users...');
  
  const { prisma } = await import('../database/client.js');
  const users = await prisma.user.findMany({
    where: {
      githubUsername: { not: null },
    },
  });
  
  for (const user of users) {
    try {
      await syncUserRoles(user.id, user.discordId);
    } catch (error) {
      console.error(`Error syncing roles for user ${user.id}:`, error);
    }
  }
  
  console.log('✅ Role sync complete');
}
