import { SITE } from "@/consts"
import { getCollection, type CollectionEntry } from "astro:content"
import { isSubpost } from "@/lib/utils"
import { execFileSync } from "node:child_process"
import { statSync } from "node:fs"

export const pageTitle = (title: string) => `${SITE.title} · ${title}`

export async function getPosts(): Promise<CollectionEntry<"writing">[]> {
  const posts = await getCollection("writing", ({ data }) => !data.draft)
  return posts
    .filter((post) => !isSubpost(post.id))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
}

export async function getSubposts(): Promise<
  Map<string, CollectionEntry<"writing">[]>
> {
  const posts = await getCollection(
    "writing",
    ({ id, data }) => !data.draft && id.split("/").length === 2,
  )
  posts.sort(
    (a, b) =>
      (a.data.order ?? Infinity) - (b.data.order ?? Infinity) ||
      a.data.date.getTime() - b.data.date.getTime(),
  )
  return Map.groupBy(posts, (post) => post.id.split("/")[0])
}

export async function getTags(): Promise<
  Map<string, CollectionEntry<"writing">[]>
> {
  const posts = await getPosts()
  const series = await getSubposts()
  const tags = new Map<string, CollectionEntry<"writing">[]>()
  for (const post of posts) {
    const chain = [post, ...(series.get(post.id) ?? [])]
    for (const tag of new Set(
      chain.flatMap((entry) => entry.data.tags ?? []),
    )) {
      const tagged = tags.get(tag)
      if (tagged) tagged.push(post)
      else tags.set(tag, [post])
    }
  }
  return new Map(
    [...tags].sort(
      ([a, postsA], [b, postsB]) =>
        postsB.length - postsA.length || a.localeCompare(b),
    ),
  )
}

const byTitle = (a: CollectionEntry<"books">, b: CollectionEntry<"books">) =>
  a.data.title.localeCompare(b.data.title)

export type LibraryBooks = {
  favorites: CollectionEntry<"books">[]
  reading: CollectionEntry<"books">[]
  bucketlist: CollectionEntry<"books">[]
  years: [number, CollectionEntry<"books">[]][]
  dnf: CollectionEntry<"books">[]
}

export async function getLibraryBooks(): Promise<LibraryBooks> {
  const books = await getCollection("books")

  const favorites = books
    .filter((book) => book.data.favorite)
    .sort(
      (a, b) =>
        (b.data.finished?.getTime() ?? 0) - (a.data.finished?.getTime() ?? 0),
    )
  const reading = books
    .filter((book) => book.data.status === "reading")
    .sort(
      (a, b) =>
        (b.data.started?.getTime() ?? 0) - (a.data.started?.getTime() ?? 0),
    )
  const bucketlist = books
    .filter((book) => book.data.status === "bucketlist")
    .sort(byTitle)
  const dnf = books.filter((book) => book.data.status === "dnf").sort(byTitle)
  const finished = books.filter(
    (book) => book.data.status === "finished" && book.data.finished,
  )

  const byYear = Map.groupBy(finished, (book) =>
    book.data.finished!.getFullYear(),
  )
  const years: [number, CollectionEntry<"books">[]][] = [...byYear]
    .sort(([a], [b]) => b - a)
    .map(([year, entries]) => [
      year,
      entries.sort(
        (a, b) => b.data.finished!.getTime() - a.data.finished!.getTime(),
      ),
    ])

  return { favorites, reading, bucketlist, years, dnf }
}

export async function getLatestNow(): Promise<
  CollectionEntry<"now"> | undefined
> {
  const entries = await getCollection("now")
  return entries.reduce<CollectionEntry<"now"> | undefined>(
    (latest, entry) =>
      !latest || entry.id.localeCompare(latest.id) > 0 ? entry : latest,
    undefined,
  )
}

export function getLastUpdated(filePath?: string): Date | undefined {
  if (!filePath) return undefined

  try {
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%aI", "--", filePath],
      { encoding: "utf-8" },
    ).trim()
    if (output) return new Date(output)
  } catch {
    // fall through to mtime below
  }

  try {
    return statSync(filePath).mtime
  } catch {
    return undefined
  }
}
