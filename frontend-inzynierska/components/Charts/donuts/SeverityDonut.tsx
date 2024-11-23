import { useState } from "react";
import { Card, DonutChart, Title } from "@tremor/react";

type SeverityDonutProps = {
  data: { severity: string; findings: number }[];
  onSeveritySelect: (severity: string | null) => void;
  getSeverityLabel: (severity: number) => string;
};

// Utility function to aggregate data by severity level
const aggregateDataBySeverity = (
  data: { severity: string; findings: number }[],
  getSeverityLabel: (severity: number) => string,
) => {
  // Use a map to store aggregated findings with severity information
  const severityMap: Record<string, { findings: number; severity: string }> =
    {};

  data.forEach((item) => {
    const severityValue = Number.parseFloat(item.severity);
    const label = getSeverityLabel(severityValue);

    if (severityMap[label]) {
      severityMap[label].findings += item.findings;
    } else {
      severityMap[label] = {
        findings: item.findings,
        severity: item.severity, // Store the original severity value
      };
    }
  });

  // Convert the severityMap to an array suitable for the DonutChart
  return Object.keys(severityMap).map((label) => ({
    name: label,
    findings: severityMap[label].findings,
    severity: severityMap[label].severity, // Include severity value
  }));
};

const SeverityDonut: React.FC<SeverityDonutProps> = ({
  data,
  onSeveritySelect,
  getSeverityLabel,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Aggregate the data to ensure each severity label is unique
  const transformedData = aggregateDataBySeverity(data, getSeverityLabel);

  const handleIconClick = () => {
    setTooltipVisible((prevVisible) => !prevVisible);
  };

  return (
    <Card>
      <div className="relative inline-block">
        <div className="flex items-center">
          <Title>Findings by Severity Level</Title>
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
                id="tooltip-severity"
                role="tooltip"
                className="absolute -top-2 left-6 z-10 mt-2 w-52 rounded-lg bg-graydark px-3 py-2 text-sm font-medium text-white shadow-md"
              >
                Severity levels show the classification of the CVSS score, from
                low to critical impact.
              </div>
            )}
          </div>
        </div>
      </div>

      <DonutChart
        className="mt-6"
        data={transformedData}
        category="findings"
        index="name"
        valueFormatter={(value) => value.toString()}
        colors={["green", "yellow", "blue", "orange", "red"]}
        onValueChange={(v) => {
          if (v && v.severity) {
            onSeveritySelect(v.severity);
          } else {
            onSeveritySelect(null);
          }
        }}
      />
    </Card>
  );
};

export default SeverityDonut;
