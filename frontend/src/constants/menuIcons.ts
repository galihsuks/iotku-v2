import {
  BookOpen,
  Boxes,
  Building2,
  CalendarCheck2,
  ChartColumn,
  Circle,
  ClipboardList,
  FilePenLine,
  FileBarChart2,
  FolderKanban,
  FolderTree,
  Gift,
  HeartHandshake,
  Home,
  Images,
  LayoutTemplate,
  LayoutDashboard,
  Logs,
  MailOpen,
  MessageSquareHeart,
  PackageSearch,
  ReceiptText,
  Send,
  Settings,
  Shield,
  SlidersHorizontal,
  SquareStack,
  UserRound,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { DropdownOption } from "../interfaces/dropdown";

export const menuIconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Boxes,
  Users,
  Shield,
  Settings,
  BookOpen,
  ChartColumn,
  Home,
  Logs,
  MailOpen,
  SlidersHorizontal,
  SquareStack,
  ReceiptText,
  FileBarChart2,
  ClipboardList,
  Building2,
  FolderKanban,
  FolderTree,
  FilePenLine,
  PackageSearch,
  HeartHandshake,
  Gift,
  Images,
  LayoutTemplate,
  CalendarCheck2,
  MessageSquareHeart,
  Send,
  UserRound,
  UsersRound,
  };

export const menuIconOptions: DropdownOption[] = Object.keys(menuIconMap)
  .sort((first, second) => first.localeCompare(second))
  .map((iconName) => ({
    value: iconName,
    label: iconName,
  }));

export const resolveMenuIcon = (iconName?: string | null, fallback: LucideIcon = Circle): LucideIcon => {
  if (!iconName) return fallback;
  return menuIconMap[iconName] ?? fallback;
};
