import { z } from 'zod'

// Property Schema
const PropertySchema = z.object({
  name: z.string(),
  value: z.string(),
  class: z.string().optional(),
  ns: z.string().optional(),
})

// Link Schema
const LinkSchema = z.object({
  href: z.string(),
  rel: z.string(),
})

// Guidelines Schema
const GuidelineSchema = z.object({
  prose: z.string(),
})

// Parameter Schema
const ParameterSchema = z.object({
  id: z.string(),
  props: z.array(PropertySchema),
  label: z.string().optional(),
  guidelines: z.array(GuidelineSchema).optional(),
  select: z
    .object({
      'how-many': z.string(),
      'choice': z.array(z.string()),
    })
    .optional(),
})

// Assessment Objects Schema
const AssessmentObjectsSchema = z.object({
  name: z.string(),
  prose: z.string(),
})

// Assessment Method Schema
const AssessmentMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  props: z.array(PropertySchema),
  parts: z.array(AssessmentObjectsSchema),
})

// Control Enhancement Schema
const ControlEnhancementSchema = z.object({
  id: z.string(),
  class: z.string(),
  title: z.string(),
  props: z.array(PropertySchema),
  links: z.array(LinkSchema),
})

// Statement Part Schema
const StatementPartSchema = z.object({
  id: z.string(),
  name: z.string(),
  props: z.array(PropertySchema).optional(),
  prose: z.string(),
})

// Part Schema (recursive structure)
const PartSchema: z.ZodType<{
  id?: string
  name: string
  parts?: Array<z.infer<typeof PartSchema>>
  prose?: string
  props?: Array<z.infer<typeof PropertySchema>>
  links?: Array<z.infer<typeof LinkSchema>>
}> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    name: z.string(),
    parts: z.array(PartSchema).optional(),
    prose: z.string().optional(),
    props: z.array(PropertySchema).optional(),
    links: z.array(LinkSchema).optional(),
  })
)

// Main Control Schema
export const SP800ControlSchema = z.object({
  id: z.string(),
  class: z.string(),
  title: z.string(),
  params: z.array(ParameterSchema).optional(),
  props: z.array(PropertySchema),
  links: z.array(LinkSchema),
  parts: z.array(PartSchema),
  controls: z.array(z.any()).optional(),
})

// Type inference
export type SP800Control = z.infer<typeof SP800ControlSchema>
