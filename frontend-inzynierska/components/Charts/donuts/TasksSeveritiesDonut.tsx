import { useState, useEffect } from "react";
import axios from "axios";
import { Card, DonutChart, Title } from "@tremor/react";

// Function to determine the severity label based on mean severity score
const getSeverityLabel = (
  meanSeverity: number,
): "Low" | "Medium" | "High" | "Critical" => {
  if (meanSeverity >= 0 && meanSeverity < 3.0) return "Low";
  if (meanSeverity >= 3.0 && meanSeverity < 7.0) return "Medium";
  if (meanSeverity >= 7.0 && meanSeverity < 9.0) return "High";
  if (meanSeverity >= 9.0) return "Critical";
  return "Low"; // Default to "Low" if severity is out of range
};

const TasksSeveritiesDonut = () => {
  const [tasksBySeverity, setTasksBySeverity] = useState<any[]>([]);

  // Function to fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/greenbone/tasks-by-severity-from-api",
        );

        // Parse the JSON response from the API
        const parsedData = JSON.parse(
          response.data.flaskResponse.tasks_by_severity,
        );

        console.log("parsedData", parsedData);
        // Transform the data to aggregate findings by severity level
        const severityMap: { [key: string]: number } = {
          Low: 0,
          Medium: 0,
          High: 0,
          Critical: 0,
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

        setTasksBySeverity(transformedData);
      } catch (error) {
        console.error("Error fetching tasks by severity:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <Title>Tasks by Severity Class</Title>
      <DonutChart
        className="mt-6"
        data={tasksBySeverity}
        category="findings"
        index="name"
        valueFormatter={(value) => value.toString()}
        colors={["green", "yellow", "blue", "red"]}
      />
    </Card>
  );
};

export default TasksSeveritiesDonut;
