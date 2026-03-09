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

const RevisionSchema = z.object({
  'title': z.string(),
  'last-modified': z.string(),
  'version': z.string(),
  'oscal-version': z.string(),
  'links': z.array(LinkSchema).optional(),
  'remarks': z.string().optional(),
})

const PropSchema = z.object({
  name: z.string(),
  value: z.string(),
})

const RoleSchema = z.object({
  id: z.string(),
  title: z.string(),
})

const AddressSchema = z.object({
  'addr-lines': z.array(z.string()),
  'city': z.string(),
  'state': z.string(),
  'postal-code': z.string(),
})

const PartySchema = z.object({
  'uuid': z.string(),
  'type': z.string(),
  'name': z.string(),
  'email-addresses': z.array(z.string()),
  'addresses': z.array(AddressSchema),
})

const ResponsiblePartySchema = z.object({
  'role-id': z.string(),
  'party-uuids': z.array(z.string()),
})

const MetadataSchema = z.object({
  'title': z.string(),
  'last-modified': z.string(),
  'version': z.string(),
  'oscal-version': z.string(),
  'revisions': z.array(RevisionSchema),
  'props': z.array(PropSchema),
  'links': z.array(LinkSchema),
  'roles': z.array(RoleSchema),
  'parties': z.array(PartySchema),
  'responsible-parties': z.array(ResponsiblePartySchema),
})

export const NistGroupSchema = z.object({
  id: z.string(),
  class: z.string(),
  title: z.string(),
  params: z.array(ParameterSchema).optional(),
  props: z.array(PropertySchema),
  links: z.array(LinkSchema),
  parts: z.array(PartSchema),
  controls: z.array(z.any()).optional(),
})

const CatalogSchema = z.object({
  uuid: z.string(),
  metadata: MetadataSchema,
  groups: z.array(NistGroupSchema),
})

export const NistCatalogSchema = z.object({
  catalog: CatalogSchema,
})

export type NistCatalog = z.infer<typeof NistCatalogSchema>
