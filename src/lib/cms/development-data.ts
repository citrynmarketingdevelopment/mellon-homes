import { z } from "zod";

export const stageNames = { construction: "Under construction", ready: "Ready to build", planning: "In plan check" } as const;
export const projectSchema = z.object({
  id: z.uuid(),
  address: z.string().trim().min(3).max(180),
  city: z.string().trim().min(2).max(80),
  type: z.string().trim().min(2).max(80),
  stage: z.enum(["construction", "ready", "planning"]),
  description: z.string().trim().max(2000),
}).strict();
export const pipelineSchema = z.object({ projects: z.array(projectSchema).max(100), revision: z.number().int().min(0) }).strict()
  .refine(data => new Set(data.projects.map(project => project.id)).size === data.projects.length, "Project IDs must be unique.");
export type DevelopmentProject = z.infer<typeof projectSchema>;
export type Pipeline = z.infer<typeof pipelineSchema>;
export const defaultProjects: DevelopmentProject[] = [
  ["1806 Williams Street", "Bakersfield", "Fourplex", "construction"],
  ["2209 Palm Street", "Bakersfield", "Fourplex", "construction"],
  ["Rodriguez Street, Shafter", "Shafter", "Duplex", "construction"],
  ["1307 Grace Street", "Bakersfield", "Triplex", "ready"],
  ["Martinez Street, Shafter", "Shafter", "Duplex", "ready"],
  ["215 Clifton Street", "Bakersfield", "Duplex", "planning"],
  ["1311 Eureka Street", "Bakersfield", "Triplex", "planning"],
  ["1231 Quincy Street", "Bakersfield", "Duplex", "planning"],
].map(([address, city, type, stage], index) => ({ id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, address, city, type, stage: stage as DevelopmentProject["stage"], description: "" }));
