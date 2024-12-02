import { Card } from "antd";
import React from "react";

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  amount: string;
  percentageChange?: string;
  trendColor?: string;
}

const LandingCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  amount,
  percentageChange,
  trendColor,
}) => {
  return (
    <Card
      className="  max-w-sm  bg-gradient-to-br rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 "
      bodyStyle={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Row: Icon and Title */}
      <div className="flex items-center justify-between">
        {/* Icon */}

        {/* Title */}
        <span className=" text-sm uppercase tracking-wider">{title}</span>
        <div className="text-2xl pr-3">{icon}</div>
      </div>

      {/* Amount */}
      <span className="text-md font-bold text-gray-800 text-start">
        {amount}
      </span>

      {/* Divider */}
      <div className="mt-2 h-1 w-full bg-gradient-to-r from-sky-400 to-green-400 rounded-full"></div>
    </Card>
  );
};

export default LandingCard;
