import { glob } from "astro/loaders"
import { defineCollection, reference } from "astro:content"
import { z } from "astro/zod"

const authors = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.md",
    base: "./src/content/authors",
  }),
  schema: z.object({
    name: z.string(),
    pronouns: z.string().optional(),
    avatar: z.url().or(z.string().startsWith("/")),
    bio: z.string().optional(),
    mail: z.email().optional(),
    socials: z.record(z.string(), z.url()).optional(),
  }),
})

const writing = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.md",
    base: "./src/content/writing",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      order: z.number().optional(),
      tags: z.array(z.string()).optional(),
      authors: z.array(reference("authors")),
      image: image().optional(),
      draft: z.boolean().optional(),
    }),
})

const books = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.md",
    base: "./src/content/books",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.string(),
      cover: image(),
      status: z.enum(["bucketlist", "reading", "finished", "dnf"]),
      rating: z.number().min(0).max(5).default(0),
      favorite: z.boolean().default(false),
      started: z.coerce.date().optional(),
      finished: z.coerce.date().optional(),
      description: z.string(),
      tags: z.array(z.string()).optional(),
    }),
})

const now = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.md",
    base: "./src/content/now",
  }),
  schema: z
    .object({
      work: z.array(z.string()).default([]),
      read: z.array(z.string()).default([]),
      interest: z.array(z.string()).default([]),
      travel: z.array(z.string()).default([]),
    })
    .refine(
      (data) => Object.values(data).some((items) => items.length > 0),
      { message: "A now entry needs at least one item in work, read, interest, or travel" },
    ),
})

export const collections = { writing, authors, books, now }
