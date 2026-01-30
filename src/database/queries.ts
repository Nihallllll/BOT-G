import { prisma } from './client.js';

export const userQueries = {
  async findByDiscordId(discordId: string) {
    return await prisma.user.findUnique({
      where: { discordId },
    });
  },

  async findByGithubUsername(githubUsername: string) {
    return await prisma.user.findUnique({
      where: { githubUsername },
    });
  },

  async createUser(discordId: string) {
    return await prisma.user.create({
      data: { discordId },
    });
  },

  async linkGithub(discordId: string, githubUsername: string) {
    return await prisma.user.update({
      where: { discordId },
      data: {
        githubUsername,
        isVerified: true,
        linkedAt: new Date(),
      },
    });
  },

  async unlinkGithub(discordId: string) {
    return await prisma.user.update({
      where: { discordId },
      data: {
        githubUsername: null,
        isVerified: false,
        linkedAt: null,
      },
    });
  },

  async getAllLinked() {
    return await prisma.user.findMany({
      where: {
        githubUsername: { not: null },
        isVerified: true,
      },
    });
  },
};

export const contributionQueries = {
  async create(data: {
    userId: number;
    type: string;
    repoName: string;
    githubId: number;
    points: number;
    metadata?: string;
  }) {
    return await prisma.contribution.create({ data });
  },

  async findByGithubId(type: string, repoName: string, githubId: number) {
    return await prisma.contribution.findUnique({
      where: {
        type_repoName_githubId: {
          type,
          repoName,
          githubId,
        },
      },
    });
  },

  async countByUser(userId: number, type?: string) {
    return await prisma.contribution.count({
      where: {
        userId,
        ...(type && { type }),
      },
    });
  },

  async countSince(userId: number, type: string, since: Date) {
    return await prisma.contribution.count({
      where: {
        userId,
        type,
        createdAt: { gte: since },
      },
    });
  },

  async getRecentByUser(userId: number, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    return await prisma.contribution.findMany({
      where: {
        userId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};

export const scoreQueries = {
  async getOrCreate(userId: number) {
    let score = await prisma.score.findUnique({
      where: { userId },
    });

    if (!score) {
      score = await prisma.score.create({
        data: { userId },
      });
    }

    return score;
  },

  async updateScore(userId: number, points: number, type: string) {
    const incrementField = type === 'pr' ? 'prCount' : type === 'review' ? 'reviewCount' : 'issueCount';
    
    return await prisma.score.update({
      where: { userId },
      data: {
        totalPoints: { increment: points },
        [incrementField]: { increment: 1 },
        lastContribution: new Date(),
      },
    });
  },

  async getLeaderboard(limit: number = 10) {
    return await prisma.score.findMany({
      take: limit,
      orderBy: { totalPoints: 'desc' },
      include: { user: true },
    });
  },

  async recalculateRanks() {
    const scores = await prisma.score.findMany({
      orderBy: { totalPoints: 'desc' },
    });

    for (let i = 0; i < scores.length; i++) {
      await prisma.score.update({
        where: { userId: scores[i]!.userId },
        data: { rank: i + 1 },
      });
    }
  },
};

export const syncQueries = {
  async getLastSync(key: string): Promise<Date | null> {
    const state = await prisma.syncState.findUnique({
      where: { key },
    });
    return state?.lastSync || null;
  },

  async updateLastSync(key: string, timestamp: Date) {
    await prisma.syncState.upsert({
      where: { key },
      create: { key, lastSync: timestamp },
      update: { lastSync: timestamp },
    });
  },
};

export const issueQueries = {
  async assign(userId: number, repoName: string, issueNumber: number) {
    return await prisma.assignedIssue.create({
      data: {
        userId,
        repoName,
        issueNumber,
      },
    });
  },

  async release(userId: number, repoName: string, issueNumber: number) {
    return await prisma.assignedIssue.updateMany({
      where: {
        userId,
        repoName,
        issueNumber,
      },
      data: {
        status: 'released',
      },
    });
  },

  async getUserIssues(userId: number) {
    return await prisma.assignedIssue.findMany({
      where: {
        userId,
        status: 'assigned',
      },
    });
  },
};
