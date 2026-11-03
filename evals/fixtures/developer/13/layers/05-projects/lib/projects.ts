export type Project = {
  id: string;
  name: string;
  owner: string;
  createdAt: string;
};

const SEED: readonly Project[] = [
  { id: 'p-1', name: 'Website refresh', owner: 'dana', createdAt: '2026-08-02T10:15:00.000Z' },
  { id: 'p-2', name: 'Billing export', owner: 'omar', createdAt: '2026-08-19T14:40:00.000Z' },
];

const projects = new Map<string, Project>();
let lastNumber = 0;

export function resetProjects(): void {
  projects.clear();
  for (const project of SEED) projects.set(project.id, { ...project });
  lastNumber = SEED.length;
}

resetProjects();

export function listProjects(): Project[] {
  return [...projects.values()];
}

export function findProject(id: string): Project | undefined {
  return projects.get(id);
}

export function createProject(input: { name: string; owner: string }): Project {
  lastNumber += 1;
  const project: Project = {
    id: `p-${lastNumber}`,
    name: input.name,
    owner: input.owner,
    createdAt: new Date().toISOString(),
  };
  projects.set(project.id, project);
  return project;
}

// Returns true when a project with this id existed and was removed.
export function deleteProject(id: string): boolean {
  return projects.delete(id);
}
