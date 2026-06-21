import { z } from "zod";

const baseFields = {
  function: z.string().min(1),
  job_title: z.string().min(1).max(100),
  role_level: z.string().min(1),
  years_experience: z.string().min(1),
  location: z.string().min(1),
  location_state: z.string().optional(),
  location_country: z.string().optional(),
  work_arrangement: z.string().min(1),
  currency: z.string().min(1),
  monthly_gross: z.number().positive(),
  monthly_net: z.number().positive().optional(),
  gender: z.string().min(1),
  age_range: z.string().min(1),
  satisfaction: z.number().int().min(1).max(5),
  confirmed_currency: z.string().optional(),
  multi_currency: z.boolean().optional(),
  benefits: z.array(z.string()).optional(),
  _honeypot: z.string().max(0).optional(),
};

const companyPathObject = z.object({
  _path: z.literal("company"),
  ...baseFields,
  company_name: z.string().min(1),
  education: z.string().optional(),
  negotiated: z.enum(["Yes", "Sort of", "No"]).optional(),
  negotiation_result: z.string().optional(),
  has_equity: z.boolean().optional(),
  has_bonus: z.boolean().optional(),
});

const anonymousPathObject = z.object({
  _path: z.literal("anonymous"),
  ...baseFields,
  foreign_employer: z.boolean(),
  industry: z.string().min(1),
  education: z.string().min(1),
  company_stage: z.string().optional(),
  company_size: z.string().optional(),
  company_age: z.string().optional(),
  headquartered_in_nigeria: z.boolean().optional(),
  company_hq: z.string().optional(),
  team_size: z.string().min(1),
  manage_others: z.boolean(),
  direct_reports: z.string().optional(),
  report_to: z.string().min(1),
  negotiated: z.enum(["Yes", "Sort of", "No"]),
  negotiation_outcome: z.string().optional(),
  negotiation_result: z.string().optional(),
  has_bonus: z.boolean(),
  bonus_range: z.string().optional(),
  has_equity: z.boolean(),
});

export const companyPathSchema = companyPathObject.refine(
  (d) => !d.monthly_net || d.monthly_net <= d.monthly_gross,
  { message: "Net salary cannot exceed gross", path: ["monthly_net"] },
);

export const anonymousPathSchema = anonymousPathObject
  .refine(
    (d) => !d.monthly_net || d.monthly_net <= d.monthly_gross,
    { message: "Net salary cannot exceed gross", path: ["monthly_net"] },
  )
  .refine(
    (d) => {
      if (d.foreign_employer === false) {
        return !!d.company_stage && !!d.company_size && !!d.company_age && d.headquartered_in_nigeria !== undefined;
      }
      return true;
    },
    { message: "Nigerian employer details required", path: ["company_stage"] },
  )
  .refine(
    (d) => {
      if (d.foreign_employer === true) {
        return !!d.company_hq && !!d.company_size;
      }
      return true;
    },
    { message: "Foreign employer details required", path: ["company_hq"] },
  )
  .refine(
    (d) => {
      if (d.negotiated === "Yes" || d.negotiated === "Sort of") {
        return !!d.negotiation_outcome;
      }
      return true;
    },
    { message: "Negotiation outcome required", path: ["negotiation_outcome"] },
  )
  .refine(
    (d) => {
      if (d.has_bonus) {
        return !!d.bonus_range;
      }
      return true;
    },
    { message: "Bonus range required", path: ["bonus_range"] },
  );

export const submissionSchema = z.discriminatedUnion("_path", [
  companyPathObject,
  anonymousPathObject,
]).superRefine((data, ctx) => {
  if (data.monthly_net && data.monthly_net > data.monthly_gross) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Net salary cannot exceed gross",
      path: ["monthly_net"],
    });
  }

  if (data._path === "anonymous") {
    if (data.foreign_employer === false) {
      if (!data.company_stage || !data.company_size || !data.company_age || data.headquartered_in_nigeria === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nigerian employer details required",
          path: ["company_stage"],
        });
      }
    }
    if (data.foreign_employer === true) {
      if (!data.company_hq || !data.company_size) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Foreign employer details required",
          path: ["company_hq"],
        });
      }
    }
    if ((data.negotiated === "Yes" || data.negotiated === "Sort of") && !data.negotiation_outcome) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Negotiation outcome required",
        path: ["negotiation_outcome"],
      });
    }
    if (data.has_bonus && !data.bonus_range) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bonus range required",
        path: ["bonus_range"],
      });
    }
  }
});

export type CompanyFormData = z.infer<typeof companyPathSchema>;
export type AnonymousFormData = z.infer<typeof anonymousPathSchema>;
export type SubmissionData = z.infer<typeof submissionSchema>;
