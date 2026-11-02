import "server-only";
import { cache } from "react";
import { database } from "./db";
import { databaseConfigured } from "./config";
import { defaultProjects, type Pipeline } from "./development-data";

export const getPipeline = cache(async (): Promise<Pipeline> => {
  if (!databaseConfigured()) return { projects: defaultProjects, revision: 0 };
  const result = await database().query<{ data: Pipeline["projects"]; revision: number }>("SELECT data, revision FROM mellon_content WHERE key='development'");
  return result.rows[0] ? { projects: result.rows[0].data, revision: result.rows[0].revision } : { projects: defaultProjects, revision: 0 };
});

export async function savePipeline({ projects, revision }: Pipeline) {
  const result = revision === 0
    ? await database().query("INSERT INTO mellon_content (key, data) VALUES ('development', $1) ON CONFLICT DO NOTHING RETURNING revision", [JSON.stringify(projects)])
    : await database().query("UPDATE mellon_content SET data=$1, revision=revision+1 WHERE key='development' AND revision=$2 RETURNING revision", [JSON.stringify(projects), revision]);
  return result.rows[0] ? { projects, revision: result.rows[0].revision } : null;
}
