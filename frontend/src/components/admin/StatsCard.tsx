import { LucideIcon } from "lucide-react";

type Stat = {
  title: string;
  value: string;
  change: string;
  Icon: LucideIcon;
  color: string;
  bgColor: string;
};

type StatsCardProps = {
  stat: Stat;
};

const StatsCard: React.FC<StatsCardProps> = ({ stat }) => {
  return (
    <div className={`p-4 rounded-lg ${stat.bgColor}`}>
      <div className="flex items-center">
        <stat.Icon className={`w-6 h-6 text-white bg-gradient-to-r ${stat.color} p-1 rounded`} />
        <div className="ml-4">
          <h3 className="font-medium">{stat.title}</h3>
          <p className="text-xl font-bold">{stat.value}</p>
          <span className="text-sm text-gray-500">{stat.change}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
