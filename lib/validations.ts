import { z } from 'zod'

// Program validation schema
export const ProgramInput = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  amount: z.string().optional(),
  deadline: z.coerce.date().nullable().optional(),
  url: z.string().url('Must be a valid URL'),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  stateId: z.string().cuid('Must be a valid state ID'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
}).refine((data) => {
  // Deadline cannot be in the past
  if (data.deadline && data.deadline < new Date()) {
    return false
  }
  return true
}, {
  message: 'Deadline cannot be in the past',
  path: ['deadline']
})

// State validation schema
export const StateInput = z.object({
  name: z.string().min(2, 'State name must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  code: z.string().length(2, 'State code must be exactly 2 characters'),
  description: z.string().optional(),
  population: z.number().int().positive().optional()
})

// FAQ validation schema
export const FAQInput = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  answer: z.string().min(10, 'Answer must be at least 10 characters'),
  order: z.number().int().default(0),
  active: z.boolean().default(true)
})

// Health check validation
export const HealthCheckInput = z.object({
  name: z.string().min(1, 'Health check name is required'),
  ok: z.boolean(),
  details: z.record(z.any()).optional()
})

// Search validation
export const SearchInput = z.object({
  query: z.string().min(1, 'Search query is required'),
  state: z.string().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional()
})

// Pagination validation
export const PaginationInput = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'deadline', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Grant update validation (for API endpoints)
export const GrantUpdateInput = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  amount: z.string().optional(),
  deadline: z.coerce.date().optional(),
  url: z.string().url().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
})

// Bulk operations validation
export const BulkUpdateInput = z.object({
  ids: z.array(z.string().cuid()).min(1, 'At least one ID is required'),
  updates: GrantUpdateInput
})

// Export types
export type ProgramInputType = z.infer<typeof ProgramInput>
export type StateInputType = z.infer<typeof StateInput>
export type FAQInputType = z.infer<typeof FAQInput>
export type HealthCheckInputType = z.infer<typeof HealthCheckInput>
export type SearchInputType = z.infer<typeof SearchInput>
export type PaginationInputType = z.infer<typeof PaginationInput>
export type GrantUpdateInputType = z.infer<typeof GrantUpdateInput>
export type BulkUpdateInputType = z.infer<typeof BulkUpdateInput>
