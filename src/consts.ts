import type { SvgComponent } from "astro/types"
import Blog from "@/assets/icons/blog.svg"
import Cosmos from "@/assets/icons/cosmos.svg"
import Email from "@/assets/icons/email.svg"
import Home from "@/assets/icons/home.svg"
import Instagram from "@/assets/icons/instagram.svg"
import Projects from "@/assets/icons/projects.svg"
import RSS from "@/assets/icons/rss.svg"

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
  key: string
  external?: boolean
}

export const NAV_GROUPS: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/", label: "Home", icon: Home, key: "1" },
      { href: "/blog", label: "Blog", icon: Blog, key: "2" },
      { href: "/projects", label: "Projects", icon: Projects, key: "3" },
    ],
  },
  {
    label: "Stay in touch",
    items: [
      {
        href: "https://www.instagram.com/ltvi3t",
        label: "Instagram",
        icon: Instagram,
        key: "4",
        external: true,
      },
      {
        href: "https://www.cosmos.so/viet",
        label: "Cosmos",
        icon: Cosmos,
        key: "5",
        external: true,
      },
      {
        href: "mailto:me@ltviet.com",
        label: "Email",
        icon: Email,
        key: "6",
        external: true,
      },
      { href: "/rss.xml", label: "RSS", icon: RSS, key: "7", external: true },
    ],
  },
]
