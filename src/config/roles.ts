import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface RoleConfig {
  discord_role_id: string;
  name: string;
  criteria: {
    must_have?: Record<string, any>;
    any_of?: Record<string, any>;
  };
  remove_if?: Record<string, any>;
}

export interface RolesConfig {
  roles: Record<string, RoleConfig>;
}

let rolesConfig: Record<string, RoleConfig> | null = null;

export function loadRoleConfig(): Record<string, RoleConfig> {
  if (!rolesConfig) {
    const configPath = path.join(__dirname, '../../config/roles.yaml');
    const file = fs.readFileSync(configPath, 'utf8');
    const parsed = yaml.load(file) as RolesConfig;
    rolesConfig = parsed.roles;
  }
  return rolesConfig;
}
