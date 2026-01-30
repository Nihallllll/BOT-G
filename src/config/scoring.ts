import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ScoringConfig {
  pull_request: {
    base: number;
    per_line: number;
    max_size_bonus: number;
    per_file: number;
    multipliers: Record<string, number>;
    caps: {
      min_points: number;
      max_points: number;
    };
    first_contribution_bonus: number;
  };
  code_review: {
    base: number;
    detailed_feedback_bonus: number;
    approved: number;
    changes_requested: number;
  };
  issue: {
    created: number;
    closed: number;
    well_documented_bonus: number;
  };
}

let scoringConfig: ScoringConfig | null = null;

export function loadScoringConfig(): ScoringConfig {
  if (!scoringConfig) {
    const configPath = path.join(__dirname, '../../config/scoring.yaml');
    const file = fs.readFileSync(configPath, 'utf8');
    scoringConfig = yaml.load(file) as ScoringConfig;
  }
  return scoringConfig;
}
