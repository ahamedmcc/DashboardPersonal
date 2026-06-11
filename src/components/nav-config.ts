import {
  BookOpen,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Mail,
  Newspaper,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavSection = {
  section: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    section: "Main",
    items: [
      { href: "/dashboard", label: "Today", icon: LayoutDashboard },
      { href: "/telegram", label: "Telegram inbox", icon: Inbox },
    ],
  },
  {
    section: "Work",
    items: [
      { href: "/tasks", label: "Tasks", icon: ListChecks },
      { href: "/meetings", label: "Meetings", icon: Users },
      { href: "/emails", label: "Emails", icon: Mail },
    ],
  },
  {
    section: "Learning",
    items: [
      { href: "/knowledge", label: "Knowledge", icon: Lightbulb },
      { href: "/books", label: "Books", icon: BookOpen },
      { href: "/news", label: "News", icon: Newspaper },
    ],
  },
  {
    section: "Review",
    items: [
      { href: "/review/daily", label: "Daily review", icon: CalendarDays },
      { href: "/review/weekly", label: "Weekly review", icon: CalendarRange },
      { href: "/review/monthly", label: "Monthly review", icon: CalendarClock },
    ],
  },
  {
    section: "Account",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];
