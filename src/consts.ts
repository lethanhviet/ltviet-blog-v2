import type { SvgComponent } from "astro/types"
import Cosmos from "@/assets/icons/cosmos.svg"
import Email from "@/assets/icons/email.svg"
import Home from "@/assets/icons/home.svg"
import Instagram from "@/assets/icons/instagram.svg"
import RSS from "@/assets/icons/rss.svg"
import Writing from "@/assets/icons/writing.svg"

export const SITE = {
  title: "ltviet",
  description: "Viet's personal site.",
  locale: "en-US",
  dir: "ltr",
  defaultPageImage: "/static/opengraph-image.png",
  defaultPostImage: "/static/1200x630.png",
} as const

type NavItem = {
  href: string
  label: string
  icon: SvgComponent
  external?: boolean
}

export const NAV_GROUPS: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/", label: "Home", icon: Home },
      { href: "/writing", label: "Writing", icon: Writing },
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
]
