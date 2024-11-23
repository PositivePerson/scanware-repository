import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Card, Title } from "@tremor/react";

// Define the type for Aggregates if using TypeScript
type Aggregates = {
  value: string;
  count: number;
  cumulative_count: number;
  stats: {
    severity: {
      min: string;
      max: string;
      mean: string;
      sum: string;
      c_sum: string;
    };
  };
  subgroups: any[];
};

// Define the type for the chart data
type ChartData = {
  name: string;
  "Severities summed": number;

  "Scans number": number;
};

const BarChartComponent = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [error, setError] = useState<string>("");

  // Fetch aggregates data from the API
  const fetchAggregates = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/greenbone/get-aggregates-from-api",
      );

      // Parse the response to convert it from string to array
      const parsedAggregates: Aggregates[] = JSON.parse(
        response.data.flaskResponse.get_aggregates.replace(/'/g, '"'),
      );

      console.log("parsedAggregates", parsedAggregates);

      // Transform the parsed data into the required chart data format
      const transformedData: ChartData[] = parsedAggregates.map((item) => ({
        name: item.value, // Use the 'value' field as the label
        "Severities summed": parseFloat(item.stats.severity.sum) || 0,

        "Scans number": item.count || 0,
      }));

      setChartData(transformedData);
    } catch (err) {
      console.error("Error fetching aggregates:", err);
      setError("Failed to load aggregates");
    }
  };

  useEffect(() => {
    fetchAggregates();
  }, []);

  const valueFormatter = (number: number) => {
    return new Intl.NumberFormat("us").format(number).toString();
  };

  return (
    <Card>
      <Title>Scan Severity and Counts by Security Check Type</Title>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <BarChart
          className="mt-4 h-72"
          data={chartData}
          index="name" // Use 'name' for the X-axis labels
          categories={["Severities summed", "Scans number"]}
          colors={["indigo", "cyan"]}
          valueFormatter={valueFormatter}
        />
      )}
    </Card>
  );
};

export default BarChartComponent;
