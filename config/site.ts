export type TSiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Y99 Finance",
  description: "Hệ thống gửi thông báo giải ngân khoản vay tự động và chuyên nghiệp.",
  navItems: [
    {
      label: "Trang chủ",
      href: "/",
    },
    {
      label: "Giải ngân",
      href: "/disbursement",
    },

  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "/sponsor",
  },
};
