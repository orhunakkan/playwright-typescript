import { z } from 'zod';

// The candidate profile every triage score is based on (PLAN.md §5.2, FR-01).
// Objects are strict so a typo in data/profile.json fails loudly instead of being ignored.

const Text = z.string().trim().min(1).max(200);
const TextList = z.array(Text).max(50);

export const SENIORITIES = ['junior', 'mid', 'senior', 'staff', 'lead'] as const;

export const ProfileSchema = z.strictObject({
  targetRoles: TextList.min(1),
  seniority: z.enum(SENIORITIES),
  yearsExperience: z.number().int().min(0).max(60),
  coreSkills: TextList.min(1),
  secondarySkills: TextList,
  locations: z.strictObject({
    remoteUS: z.boolean(),
    hybridMetros: TextList,
    onsiteMetros: TextList,
    relocate: z.boolean(),
  }),
  workAuthorization: Text,
  dealBreakers: TextList,
  excludedCompanies: TextList,
});

export type Profile = z.infer<typeof ProfileSchema>;
