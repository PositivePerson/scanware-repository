// PortBarChart.tsx
import { BarChart, Card, Title } from "@tremor/react";
import React from "react";

type PortBarChartProps = {
  data: { name: string; count: number }[];
  onPortSelect: (port: string) => void; // Expecting string only as `port`
};

const PortBarChart: React.FC<PortBarChartProps> = ({ data, onPortSelect }) => {
  return (
    <Card>
      <Title>Affected Services by Port</Title>
      <BarChart
        className="mt-6"
        data={data}
        index="name"
        categories={["count"]}
        colors={["orange"]}
        yAxisWidth={48}
        valueFormatter={(value) => value.toString()}
        onValueChange={(v) => {
          console.log("v: ", v);
          if (v && typeof v.name === "string") {
            onPortSelect(v.name); // Ensuring `name` is a string before passing
          } else {
            onPortSelect("");
          }
        }}
      />
    </Card>
  );
};

export default PortBarChart;
