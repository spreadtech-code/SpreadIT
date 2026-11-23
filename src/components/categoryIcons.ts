// Icons for the B1 categories (line icons, 1.75 stroke, per the design system).
import { Bus, Church, Heart, House, PiggyBank, Shapes, Tag, TrendingUp, type LucideIcon } from 'lucide-react-native';

const icons: Record<string, LucideIcon> = {
  family: Heart,
  rent: House,
  tithe: Church,
  savings: PiggyBank,
  investment: TrendingUp,
  everyday: Bus,
  other: Shapes,
  custom: Tag,
};

export function categoryIcon(key: string | undefined): LucideIcon {
  return (key && icons[key]) || Tag;
}
