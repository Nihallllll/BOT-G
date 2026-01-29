import { prisma } from './client';

export const userQueries = {
  async findByDiscordId(discordId: string) {
     
    const user = await prisma.user.findFirst({
        where : {
            discordId : discordId
        }
     })
     if (!user){
        return new Error("No user found with this discordId")
     }
     return user;
  },
  
  async findByGithubUsername(githubUsername: string) {
    const user = await prisma.user.findFirst({
        where : {
            githubId : githubUsername
        }
     })
     if (!user){
        return new Error("No user found with this Github username")
     }
     return user;
  },
  
  async createUser(data: { discordId: string }) {
     const user = await prisma.user.create
     
  },
  
  async linkGithub(discordId: string, githubUsername: string) {
    // Your implementation
  },
};

export const contributionQueries = {
  async create(data: any) {
    // Your implementation
  },
  
  async getRecentByUser(userId: number, days: number) {
    // Your implementation
  },
};

export const scoreQueries = {
  async getLeaderboard(limit: number) {
    // Your implementation
  },
  
  async updateUserScore(userId: number, points: number) {
    // Your implementation
  },
};