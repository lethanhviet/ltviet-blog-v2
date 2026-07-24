import { isSubpost } from "@/lib/utils"
import { getCollection, type CollectionEntry } from "astro:content"
import { execFileSync } from "node:child_process"
import { statSync } from "node:fs"

export type WritingEntry = CollectionEntry<"writing">
export type AuthorEntry = CollectionEntry<"authors">
export type BookEntry = CollectionEntry<"books">
export type NowEntry = CollectionEntry<"now">
export type NowSnapshot = NowEntry["data"]

export type WritingPageProps = {
  post: WritingEntry
  chain: WritingEntry[]
  previous?: WritingEntry
  next?: WritingEntry
}

export async function getPosts(): Promise<WritingEntry[]> {
  const posts = await getCollection("writing", ({ data }) => !data.draft)
  return posts
    .filter((post) => !isSubpost(post.id))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
}

export async function getSubposts(): Promise<Map<string, WritingEntry[]>> {
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

export async function getWritingPagePaths() {
  const [posts, subposts] = await Promise.all([getPosts(), getSubposts()])

  return posts.flatMap((parent, index) => {
    const chain = [parent, ...(subposts.get(parent.id) ?? [])]
    const props: Omit<WritingPageProps, "post"> = {
      chain,
      previous: posts[index + 1],
      next: posts[index - 1],
    }

    return chain.map((post) => ({
      params: { id: post.id },
      props: { ...props, post },
    }))
  })
}

export async function getTags(): Promise<Map<string, WritingEntry[]>> {
  const posts = await getPosts()
  const series = await getSubposts()
  const tags = new Map<string, WritingEntry[]>()
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

const byTitle = (a: BookEntry, b: BookEntry) =>
  a.data.title.localeCompare(b.data.title)

export type BookshelfBooks = {
  favorites: BookEntry[]
  reading: BookEntry[]
  bucketlist: BookEntry[]
  years: [number, BookEntry[]][]
  dnf: BookEntry[]
}

export async function getBookshelfBooks(): Promise<BookshelfBooks> {
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
  const years: [number, BookEntry[]][] = [...byYear]
    .sort(([a], [b]) => b - a)
    .map(([year, entries]) => [
      year,
      entries.sort(
        (a, b) => b.data.finished!.getTime() - a.data.finished!.getTime(),
      ),
    ])

  return { favorites, reading, bucketlist, years, dnf }
}

export async function getBookPagePaths() {
  const books = await getCollection("books")
  return books.map((book) => ({
    params: { id: book.id },
    props: { book },
  }))
}

export type BookSections = {
  keyTakeaways: string[]
  highlights: string[]
  referencedIn: string[]
}

const HEADING_TO_SECTION: Record<string, keyof BookSections> = {
  "key takeaways": "keyTakeaways",
  highlights: "highlights",
  "referenced in": "referencedIn",
}

export function parseBookSections(body?: string): BookSections {
  const sections: BookSections = {
    keyTakeaways: [],
    highlights: [],
    referencedIn: [],
  }

  let current: keyof BookSections | undefined
  for (const line of (body ?? "").split("\n")) {
    const heading = line.match(/^##\s+(.+)$/)
    if (heading) {
      current = HEADING_TO_SECTION[heading[1].trim().toLowerCase()]
      continue
    }

    const item = line.trim().replace(/^[-*]\s+/, "")
    if (current && item) sections[current].push(item)
  }

  return sections
}

export async function getLatestNow(): Promise<NowEntry | undefined> {
  const entries = await getCollection("now")
  return entries.reduce<NowEntry | undefined>(
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
