import { useState, useEffect } from "react";
import axios from "axios";
import { Card, DonutChart, Title } from "@tremor/react";

// Function to determine the severity label based on mean severity score
const getSeverityLabel = (
  meanSeverity: number,
): "Log" | "Low" | "Medium" | "High" => {
  if (meanSeverity === 0) return "Log";
  if (meanSeverity > 0 && meanSeverity < 4.0) return "Low";
  if (meanSeverity >= 4.0 && meanSeverity < 7.0) return "Medium";
  if (meanSeverity >= 7.0) return "High";
  return "Log"; // Default to "Log" if no other condition matches
};

const NvtSeveritiesDonut = () => {
  const [nvtBySeverity, setNvtBySeverity] = useState<any[]>([]);

  // Function to fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/greenbone/nvt-by-severities-from-api",
        );

        // Parse the JSON response from the API
        const parsedData = JSON.parse(
          response.data.flaskResponse.nvt_by_severities,
        );

        // Transform the data to aggregate findings by severity level
        const severityMap: { [key: string]: number } = {
          Log: 0,
          Low: 0,
          Medium: 0,
          High: 0,
        };

        parsedData.forEach((item: any) => {
          const meanSeverity = parseFloat(item.stats.severity.mean);
          const severityLabel = getSeverityLabel(meanSeverity);

          // Increment the count for the corresponding severity level
          severityMap[severityLabel] += item.count;
        });

        // Convert severityMap to an array suitable for the DonutChart
        const transformedData = Object.keys(severityMap).map((key) => ({
          name: key,
          findings: severityMap[key],
        }));

        console.log("Transformed Data for DonutChart:", transformedData);
        setNvtBySeverity(transformedData);
      } catch (error) {
        console.error("Error fetching NVT by severity:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <Title>Network Vulnerability Tests (NVT) by Severity Class</Title>
      <DonutChart
        className="mt-6"
        data={nvtBySeverity}
        category="findings"
        index="name"
        valueFormatter={(value) => value.toString()}
        colors={["green", "yellow", "blue", "purple", "orange", "red"]}
      />
    </Card>
  );
};

export default NvtSeveritiesDonut;
