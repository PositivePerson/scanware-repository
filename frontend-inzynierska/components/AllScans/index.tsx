// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { BarChart, AreaChart, DonutChart, Card, Title } from "@tremor/react";
// import SeverityBar from "../Charts/bar/PortBar";
// import CVSSAreaChart from "../Charts/area/CVSSAreaChart";
// import SeverityDonut from "../Charts/donuts/SeverityDonut";
// import PortBarChart from "../Charts/bar/PortBar";
// import CvssDonut from "../Charts/donuts/CVSSDonut";

// type ScanResultType = {
//   result_id: string;
//   host: string;
//   port: string;
//   nvt_name: string;
//   cvss_base: string;
//   severity: string;
//   threat: string;
//   description: string;
//   cve: string[];
//   date: string; // Assume date is part of each result
// };

// interface AllScans {
//   // uid: string;
// }

// const getSeverityLabel = (cvssScore: number): string => {
//   if (cvssScore <= 3.9) return "Low";
//   if (cvssScore >= 4.0 && cvssScore <= 6.9) return "Medium";
//   if (cvssScore >= 7.0 && cvssScore <= 8.9) return "High";
//   if (cvssScore >= 9.0 && cvssScore <= 10.0) return "Critical";
//   return "Unknown"; // Fallback in case the score is out of expected range
// };

// const AllScans: React.FC<AllScans> = () => {
//   const [scanResults, setScanResults] = useState<ScanResultType[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedPort, setSelectedPort] = useState<string | null>(null);
//   const [filteredResults, setFilteredResults] = useState<ScanResultType[]>([]);
//   const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
//   const [selectedCvss, setSelectedCvss] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchScanResults = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:4000/api/greenbone/all-results-from-api`, // todo
//         );
//         const scanResultData = JSON.parse(
//           response.data.flaskResponse.scan_result,
//         );
//         console.log("Scan results:", scanResultData.results);
//         setScanResults(scanResultData.results);
//         setFilteredResults(scanResultData.results);
//       } catch (err) {
//         console.error("Error fetching scan results:", err);
//         setError("Failed to load scan results");
//       }
//     };

//     fetchScanResults();
//   }, []);

//   if (error) return <p>{error}</p>;

//   const handleSeverityClick = (severity: string | null) => {
//     const newSelectedSeverity = selectedSeverity === severity ? null : severity;
//     setSelectedSeverity(newSelectedSeverity);
//     toFilterResults({
//       port: selectedPort,
//       severity: newSelectedSeverity,
//       cvss: selectedCvss,
//     });
//   };

//   const handleCvssClick = (cvss: string | null) => {
//     const newSelectedCvss = selectedCvss === cvss ? null : cvss;
//     setSelectedCvss(newSelectedCvss);
//     toFilterResults({
//       port: selectedPort,
//       severity: selectedSeverity,
//       cvss: newSelectedCvss,
//     });
//   };

//   // Toggle port filter: select or deselect to show all results
//   const handlePortClick = (port: string) => {
//     console.log("handlePortClick run with port", port);
//     // Toggle the selected port and filter results accordingly
//     const newSelectedPort = selectedPort === port ? null : port;
//     setSelectedPort(newSelectedPort);
//     toFilterResults({
//       port: newSelectedPort,
//       severity: selectedSeverity,
//       cvss: selectedCvss,
//     });
//   };

//   const toFilterResults = ({
//     port,
//     severity,
//     cvss,
//   }: {
//     port: string | null;
//     severity: string | null;
//     cvss: string | null;
//   }): void => {
//     console.log(
//       "toFilterResults run with port",
//       port,
//       "and with severity",
//       severity,
//       "and with cvss",
//       cvss,
//       "and scanResults are",
//       scanResults,
//     );
//     // Combine filters
//     let filteredResults = scanResults;

//     if (port) {
//       filteredResults = filteredResults.filter(
//         (result) => result.port === port,
//       );
//     }
//     if (severity) {
//       console.log("severity is", severity);
//       filteredResults = filteredResults.filter(
//         (result) => result.severity === severity,
//       );
//       console.log("Filtered by severity results are", filteredResults);
//     }
//     if (cvss) {
//       filteredResults = filteredResults.filter(
//         (result) => result.cvss_base === cvss,
//       );
//     }

//     // Set the filtered results
//     setFilteredResults(filteredResults);
//   };

//   // Generate data for charts
//   const severityCounts = scanResults.reduce(
//     (acc, result) => {
//       acc[result.severity] = (acc[result.severity] || 0) + 1;
//       return acc;
//     },
//     {} as Record<string, number>,
//   );

//   // const severityData = Object.entries(severityCounts).map(([key, value]) => ({
//   //   name: key,
//   //   count: value,
//   // }));

//   // Transform scanResults data for CVSSAreaChart
//   const cvssData = scanResults.map((result, index) => ({
//     index: `Result ${index + 1}`, // Label each result by index
//     CVSS: parseFloat(result.cvss_base) || 0, // Use CVSS score
//   }));

//   // Prepare data for SeverityDonut
//   const severityData = scanResults.reduce(
//     (acc, result) => {
//       const severity = result.severity || "Unknown";
//       acc[severity] = (acc[severity] || 0) + 1;
//       return acc;
//     },
//     {} as Record<string, number>,
//   );

//   const severityDataArray = Object.entries(severityData).map(
//     ([severity, count]) => ({
//       severity: severity,
//       findings: count,
//     }),
//   );

//   const cvssDataArray = Object.entries(severityData).map(([cvss, count]) => ({
//     cvss: cvss,
//     findings: count,
//   }));

//   // Aggregate findings by port
//   const findingsByPort = scanResults.reduce(
//     (acc, result) => {
//       const port = result.port || "Unknown";
//       acc[port] = (acc[port] || 0) + 1;
//       return acc;
//     },
//     {} as Record<string, number>,
//   );

//   // // Convert findingsByPort to array format for BarChart
//   // const portData = Object.entries(findingsByPort).map(([port, count]) => ({
//   //   name: port,
//   //   count,
//   // }));

//   // Convert findingsByPort to array format and sort by port number with non-numeric ports at the end
//   const portData = Object.entries(findingsByPort)
//     .map(([port, count]) => ({
//       name: port,
//       count,
//     }))
//     .sort((a, b) => {
//       // Extract the port number as an integer if possible
//       const portA = parseInt(a.name);
//       const portB = parseInt(b.name);

//       // If both ports are numeric, sort numerically
//       if (!isNaN(portA) && !isNaN(portB)) {
//         return portA - portB;
//       }

//       // If only one is numeric, place it before the non-numeric
//       if (!isNaN(portA)) return -1;
//       if (!isNaN(portB)) return 1;

//       // If both are non-numeric, keep original order or apply lexicographical sort as desired
//       return a.name.localeCompare(b.name);
//     });

//   return (
//     <>
//       {/* Charts */}
//       <div className="space-y-5">
//         <PortBarChart
//           data={portData} //
//           // onPortSelect={(port) => setSelectedPort(port)}
//           onPortSelect={handlePortClick} // Use toggle function
//         />
//         {/* <CVSSAreaChart data={cvssData} categories={["CVSS"]} /> */}
//         <div className="grid grid-cols-2 gap-4">
//           <SeverityDonut
//             data={severityDataArray}
//             onSeveritySelect={handleSeverityClick}
//             getSeverityLabel={getSeverityLabel}
//           />
//           <CvssDonut data={cvssDataArray} onCvssSelect={handleCvssClick} />
//         </div>
//       </div>

//       {/* Charts */}
//       {/* <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"> */}
//       {/* Severity Bar Chart */}
//       {/* <Card>
//           <Title>Findings by Severity</Title>
//           <BarChart
//             className="mt-6"
//             data={severityData}
//             index="name"
//             categories={["count"]}
//             colors={["blue"]}
//             valueFormatter={(value) => `${value}`}
//             yAxisWidth={48}
//           />
//         </Card> */}

//       {/* Host Donut Chart */}
//       {/* <Card>
//           <Title>Findings by Host</Title>
//           <DonutChart
//             className="mt-6"
//             data={hostDataArray}
//             category="findings"
//             index="name"
//             valueFormatter={(value) => `${value}`}
//             colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]}
//           />
//         </Card> */}

//       {/* Sample Area Chart for CVSS Scores */}
//       {/* <Card>
//           <Title>CVSS Scores Over Time</Title>
//           <AreaChart
//             className="mt-6 h-72"
//             data={scanResults.map((result, index) => ({
//               index: `Result ${index + 1}`,
//               CVSS: parseFloat(result.cvss_base) || 0,
//             }))}
//             index="index"
//             categories={["CVSS"]}
//             colors={["indigo"]}
//             valueFormatter={(value) => value.toFixed(1)}
//           />
//         </Card> */}
//       {/* </div> */}

//       {/* Table of scan results */}
//       <div className="space-y-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
//         {/* Header */}
//         <div className="px-4 py-6 md:px-6 xl:px-7.5">
//           <h2 className="text-xl font-bold text-black dark:text-white">
//             Scan Results
//           </h2>
//         </div>

//         {/* Table */}
//         {scanResults.length > 0 ? (
//           <div className="max-w-full overflow-x-auto">
//             <table className="mt-2 w-full table-auto">
//               <thead>
//                 <tr className="bg-gray-2 text-left dark:bg-meta-4">
//                   {/* Headers */}
//                   <th className="px-4 py-4 font-medium text-black dark:text-white">
//                     Result ID
//                   </th>
//                   <th className="px-4 py-4 font-medium text-black dark:text-white">
//                     Host
//                   </th>
//                   <th className="px-4 py-4 font-medium text-black dark:text-white">
//                     Port
//                   </th>
//                   <th className="px-4 py-4 font-medium text-black dark:text-white">
//                     NVT Name
//                   </th>
//                   <th className="px-4 py-4 font-medium text-black dark:text-white">
//                     CVSS
//                   </th>
//                   <th className="px-4 py-4 font-medium text-black dark:text-white">
//                     Severity
//                   </th>
//                   <th className="px-4 py-4 font-medium text-black dark:text-white">
//                     Threat
//                   </th>
//                   <th className="px-4 py-4 font-medium text-black dark:text-white">
//                     Description
//                   </th>
//                   <th className="px-4 py-4 font-medium text-black dark:text-white">
//                     CVEs
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {/* {scanResults.map((result) => ( */}
//                 {filteredResults.map((result, id) => (
//                   <tr
//                     key={result.result_id + id}
//                     className="border-b border-stroke dark:border-strokedark"
//                   >
//                     {/* Table Data */}
//                     <td className="px-4 py-4 text-sm text-black dark:text-white">
//                       {result.result_id}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-black dark:text-white">
//                       {result.host}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-black dark:text-white">
//                       {result.port}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-black dark:text-white">
//                       {result.nvt_name}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-black dark:text-white">
//                       {result.cvss_base}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-black dark:text-white">
//                       {getSeverityLabel(parseFloat(result.severity))}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-black dark:text-white">
//                       {result.threat}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-black dark:text-white">
//                       {result.description}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-black dark:text-white">
//                       {result.cve.length > 0 ? result.cve.join(", ") : "N/A"}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="px-4 py-4 text-center text-black dark:text-white">
//             Loading scan results...
//           </p>
//         )}
//       </div>
//     </>
//   );
// };

// export default AllScans;
