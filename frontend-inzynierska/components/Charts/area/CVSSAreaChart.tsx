import { AreaChart, Card, Title } from "@tremor/react";
import { useState } from "react";

type CVSSAreaChartProps = {
  data: { index: string; CVSS: number }[];
  categories: string[];
};

const valueFormatter = (number: number) => number.toFixed(1);

const CVSSAreaChart: React.FC<CVSSAreaChartProps> = ({ data, categories }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleTooltipToggle = () => setTooltipVisible(!tooltipVisible);

  return (
    <Card>
      <div className="relative inline-block">
        {/* Title with tooltip icon */}
        <div className="flex items-center">
          <Title>CVSS Scores Over Time</Title>
          <div className="relative ml-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5 cursor-pointer text-blue-600 hover:text-blue-800"
              onClick={handleTooltipToggle}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
            {/* Tooltip content */}
            {tooltipVisible && (
              <div
                className="absolute -top-2 left-6 z-10 mt-2 w-52 rounded-lg bg-graydark px-3 py-2 text-sm font-medium text-white shadow-md"
                role="tooltip"
              >
                CVSS scores represent the severity of vulnerabilities on a scale
                from 0 to 10.
                {/* <div className="tooltip-arrow" data-popper-arrow></div> */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <AreaChart
        className="mt-4 h-72"
        data={data}
        index="index"
        categories={categories}
        colors={["indigo"]}
        valueFormatter={valueFormatter}
      />
    </Card>
  );
};

export default CVSSAreaChart;
