import { useState } from "react";
import { Card, DonutChart, Title } from "@tremor/react";

type CvssDonutProps = {
  data: { cvss: string; findings: number }[];
  onCvssSelect: (cvss: string | null) => void;
};

const CvssDonut: React.FC<CvssDonutProps> = ({ data, onCvssSelect }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Transform data to use cvss labels
  const transformedData = data.map((item) => ({
    cvss: item.cvss,
    // name: getCvssLabel(Number.parseFloat(item.cvss)),
    findings: item.findings,
  }));

  const handleIconClick = () => {
    setTooltipVisible((prevVisible) => !prevVisible);
  };

  return (
    <Card>
      <div className="relative inline-block">
        <div className="flex items-center">
          <Title>Findings by Cvss v3.1</Title>
          <div className="relative ml-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5 cursor-pointer text-blue-600 hover:text-blue-800"
              onClick={handleIconClick}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
            {tooltipVisible && (
              <div
                id="tooltip-cvss"
                role="tooltip"
                className="absolute -top-2 left-6 z-10 mt-2 w-52 rounded-lg bg-graydark px-3 py-2 text-sm font-medium text-white shadow-md"
              >
                CVSS (Common Vulnerability Scoring System) is a standardized way
                to measure the severity of vulnerabilities in software and
                systems. The score is calculated using several factors, such as
                how easy the vulnerability is to exploit and the impact it has
                on confidentiality, integrity, and availability.
              </div>
            )}
          </div>
        </div>
      </div>

      <DonutChart
        className="mt-6"
        data={transformedData}
        category="findings"
        index="cvss"
        valueFormatter={(value) => value.toString()}
        colors={["green", "yellow", "blue", "purple", "orange", "red"]}
        onValueChange={(v) => {
          if (v && typeof v.cvss === "string") {
            onCvssSelect(v.cvss);
          } else {
            onCvssSelect("");
          }
        }}
      />
    </Card>
  );
};

export default CvssDonut;
