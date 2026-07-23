import type { SvgComponent } from "astro/types"
import Clock from "@/assets/icons/clock.svg"
import Cosmos from "@/assets/icons/cosmos.svg"
import Email from "@/assets/icons/email.svg"
import Home from "@/assets/icons/home.svg"
import Instagram from "@/assets/icons/instagram.svg"
import Library from "@/assets/icons/library.svg"
import RSS from "@/assets/icons/rss.svg"
import Writing from "@/assets/icons/writing.svg"

export const SITE = {
  title: "Viet\'s note",
  description:
    "Industrial system integrator sharing notes on business, tech, economics, history, books, travel, and food—ideas, experiments, and rabbit holes.",
  href: "https://ltviet.com",
  author: "ltviet",
  locale: "vi-VN",
  dir: "ltr",
  defaultPageImage: "/static/opengraph-image.png",
  defaultPostImage: "/static/1200x630.png",
} as const

export const pageTitle = (title: string) => `${SITE.title} · ${title}`

export type NavItem = {
  href: string
  label: string
  icon: SvgComponent
  external?: boolean
  activePrefixes?: readonly string[]
}

export type NavGroup = {
  label?: string
  items: readonly NavItem[]
}

export const NAV_GROUPS = [
  {
    items: [
      { href: "/", label: "Home", icon: Home },
      { href: "/writing", label: "Writing", icon: Writing },
      { href: "/now", label: "Now", icon: Clock },
      {
        href: "/library",
        label: "Library",
        icon: Library,
        activePrefixes: ["/books"],
      },
    ],
  },
  {
    label: "Stay in touch",
    items: [
      {
        href: "https://www.instagram.com/ltvi3t",
        label: "Instagram",
        icon: Instagram,
        external: true,
      },
      {
        href: "https://www.cosmos.so/ltviet",
        label: "Cosmos",
        icon: Cosmos,
        external: true,
      },
      {
        href: "mailto:me@ltviet.com",
        label: "Email",
        icon: Email,
        external: true,
      },
      { href: "/rss.xml", label: "RSS", icon: RSS, external: true },
    ],
  },
] as const satisfies readonly NavGroup[]
