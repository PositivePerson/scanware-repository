"use client";
import React from "react";

import CounterAreaChart from "@/components/Charts/area/CounterAreaChart";

import TasksSeveritiesDonut from "@/components/Charts/donuts/TasksSeveritiesDonut";
import NvtSeveritiesDonut from "@/components/Charts/donuts/NvtSeveritiesDonut";

const ECommerce: React.FC = () => {
  return (
    <>
      <div className="space-y-5 py-5">
        <CounterAreaChart />
        <TasksSeveritiesDonut />
        <NvtSeveritiesDonut />
      </div>
    </>
  );
};

export default ECommerce;
