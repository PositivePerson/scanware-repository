"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

type ScheduledScan = {
  id: string;
  name: string;
  first_run: string;
  next_run: string;
  recurrence: string;
  duration: string;
  owner: string;
  in_use: string;
};

type Target = {
  id: string;
  name: string;
  hosts: string;
  in_use: string;
};

type Scan = {
  id: string;
  name: string;
  target: Host;
  status: string;
  progress: string;
  scan_start: string | null; // Allow null or empty strings if there's no start date
  scan_end: string | null; // Allow null or empty strings if there's no end date
};

type Host = {
  id: string;
  name: string;
  ip: string;
};

const TablePlanner = () => {
  const [scheduledScans, setScheduledScans] = useState<ScheduledScan[]>([]);
  const [runningScans, setRunningScans] = useState<Scan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        // Fetch all scans from a single endpoint
        const response = await axios.get(
          "http://localhost:4000/api/greenbone/all-scans-from-api",
        );

        // Parse the response to convert it from string to array
        console.log("fetchScans raw response: ", response.data.flaskResponse);

        const allScans = JSON.parse(response.data.flaskResponse.all_scans);
        console.log("allScans is: ", allScans);

        // const allScans = JSON.parse(
        //   response.data.flaskResponse.all_scans.replace(/'/g, '"'),
        // );

        const runningScans = allScans.filter(
          (scan: { status: string }) => scan.status === "Running",
        );

        console.log("all scans: ", allScans);
        console.log("running scans: ", runningScans);
        setRunningScans(runningScans);
      } catch (err) {
        console.error("Error fetching scans:", err);
        setError("Failed to load scans");
      }
    };

    fetchScans();

    fetchScheduledScans();
  }, []);

  const fetchScheduledScans = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/greenbone/get-schedules-from-api",
      );

      // console.log("response.data: ", response.data);
      // Parse the schedules JSON from the API response
      const parsedSchedules = JSON.parse(
        response.data.flaskResponse.get_schedules,
      );

      console.log(
        "parsedSchedules.schedules from API: ",
        parsedSchedules.schedules,
      );
      // Update state with the fetched scheduled scans
      setScheduledScans(parsedSchedules.schedules);
    } catch (err) {
      console.error("Error fetching scheduled scans:", err);
      setError("Failed to load scheduled scans");
    }
  };

  const handleDelete = async (scheduleId: string) => {
    try {
      const response = await axios.delete(
        "http://localhost:4000/api/greenbone/delete-schedule-from-api",
        {
          data: { schedule_id: scheduleId },
        },
      );
      console.log("response from delete scan: ", response);
      alert("Schedule deleted successfully!");
      fetchScheduledScans();
    } catch (error) {
      console.error("Failed to delete scan:", error);
      alert("Failed to delete scan.");
    }
  };

  const handlePause = async (taskId: string) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/greenbone/pause-task-from-api",
        {
          task_id: taskId,
        },
      );
      console.log("response from pause scan: ", response);
      alert("Schedule paused successfully!");
      fetchScheduledScans();
    } catch (error) {
      console.error("Failed to pause scan:", error);
      alert("Failed to pause scan.");
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Scans Overview
        </h4>
      </div>

      {/* Running Scans Table */}
      <div className="px-4 py-4">
        <h5 className="text-lg font-medium text-black dark:text-white">
          Running Scans
        </h5>
        <div className="max-w-full overflow-x-auto">
          {runningScans.length > 0 ? (
            <table className="mt-2 w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Scan ID
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Name
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Target Name
                  </th>
                  {/* <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Status
                  </th> */}
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Progress
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Start Date
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                  {/* <th className="px-4 py-4 font-medium text-black dark:text-white">
                    End Date
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {runningScans.map((scan) => (
                  <tr key={scan.id}>
                    <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.id}
                    </td>
                    <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.name}
                    </td>
                    <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.target.name || "N/A"}
                    </td>
                    {/* <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.status}
                    </td> */}
                    <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.progress}%
                    </td>
                    <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.scan_start || "N/A"}
                    </td>
                    <td className="border-b px-4 py-4 dark:border-strokedark">
                      <div className="flex items-center justify-center space-x-3.5">
                        <button
                          className="hover:text-primary"
                          onClick={() => handlePause(scan.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="size-6 h-6 w-6"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    {/* <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.scan_end || "N/A"}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-4 text-center">No running scans</p>
          )}
        </div>

        {error && <p className="px-4 py-4 text-center text-red-600">{error}</p>}
      </div>

      {/* Scheduled Scans Table */}
      <div className="px-4 py-4">
        <h5 className="text-lg font-medium text-black dark:text-white">
          Scheduled Scans
        </h5>
        <div className="max-w-full overflow-x-auto">
          {scheduledScans?.length > 0 ? (
            <table className="mt-2 w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Schedule ID
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Name
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    First Run
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Next Run
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Recurrence
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                  {/* <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Duration
                  </th> */}
                  {/* <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Owner
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {scheduledScans.map((scan) => (
                  <tr key={scan.id}>
                    <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.id}
                    </td>
                    <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.name}
                    </td>
                    <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.first_run || "N/A"}
                    </td>
                    <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.next_run || "N/A"}
                    </td>
                    <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.recurrence || "N/A"}
                    </td>
                    <td className="border-b px-4 py-4 dark:border-strokedark">
                      <div className="flex items-center justify-center space-x-3.5">
                        <button
                          disabled={scan.in_use === "1"}
                          // className="hover:text-red-600"
                          className={` ${
                            scan.in_use === "1"
                              ? "cursor-not-allowed text-gray-4"
                              : "hover:text-red-600"
                          }`}
                          onClick={() => handleDelete(scan.id)}
                        >
                          <svg
                            className="fill-current"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                              fill=""
                            />
                            <path
                              d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                              fill=""
                            />
                            <path
                              d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                              fill=""
                            />
                            <path
                              d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    {/* <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.duration}
                    </td> */}
                    {/* <td className="border-b px-4 py-4 dark:border-strokedark">
                      {scan.owner}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-4 text-center">No scheduled scans</p>
          )}
        </div>
        {error && <p className="px-4 py-4 text-center text-red-600">{error}</p>}
      </div>
    </div>
  );
};

const ScanPlanner = () => {
  const [scanName, setScanName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [recurrenceDays, setRecurrenceDays] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [existingTargets, setExistingTargets] = useState<Target[]>([]); // Explicitly set type here
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");

  useEffect(() => {
    const fetchExistingTargets = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/greenbone/all-targets-from-api",
        );
        // Extract and clean up the targets array
        const allTargets = JSON.parse(
          response.data.flaskResponse.all_targets.replace(/'/g, '"'),
        );

        const targets = allTargets.targets.map((target: any) => ({
          id: target.id,
          name: target.name,
          hosts: Array.isArray(target.hosts)
            ? target.hosts.join("")
            : target.hosts, // Convert hosts to a string if needed
          in_use: target.in_use,
        }));

        console.log("Clean targets array: ", targets);
        setExistingTargets(targets);
      } catch (error) {
        console.error("Error fetching existing targets:", error);
      }
    };
    fetchExistingTargets();
  }, []);

  const handleTargetSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedTargetId(selectedId);

    if (selectedId === "new") {
      window.location.href = "/targets";
    }

    const selectedTarget = existingTargets.find(
      (target) => target.id === selectedId,
    ) as Target | undefined; // Explicitly typing selectedTarget

    if (selectedTarget) {
      // setScanName(selectedTarget.name);
      setIpAddress(selectedTarget.hosts);
    } else {
      setScanName("");
      setIpAddress("");
    }
  };

  const planScan = async () => {
    try {
      const endpoint =
        recurrenceDays > 0
          ? "http://localhost:4000/api/greenbone/schedule-recurring-scan-from-api"
          : "http://localhost:4000/api/greenbone/schedule-scan-from-api";

      const data =
        recurrenceDays > 0
          ? {
              task_name: scanName,
              target_ip: ipAddress,
              start_date: scheduleTime,
              recurrence_days: recurrenceDays,
            }
          : {
              task_name: scanName,
              ip: ipAddress,
              schedule_time: scheduleTime,
            };

      const res = await axios.post(endpoint, data);
      console.log("response from planScan: ", res);
      setFeedback("Scan scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling scan:", error);
      setFeedback("Failed to schedule scan.");
    }
  };

  const runScanNow = async () => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/greenbone/start-scan-from-api",
        {
          target_name: scanName,
          // target_name:
          //   "We dont pass target_name from frontend because there is no input field for this.",
          target_host: ipAddress,
        },
      );
      console.log("res: ", res);
      console.log(
        "res.data.flaskResponse.message: ",
        res.data.flaskResponse.message,
      );
      setFeedback("Scan initiated successfully!");
    } catch (error) {
      console.error("Error running scan:", error);
      setFeedback("Failed to run scan.");
    }
  };

  return (
    <div className="rounded bg-white p-4 shadow dark:bg-boxdark">
      <h4 className="mb-4 text-xl font-semibold">Schedule or Run a Scan</h4>
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Target</label>
        <select
          className="w-full rounded border px-3 py-2 text-black"
          value={selectedTargetId}
          onChange={handleTargetSelection}
        >
          <option value="">-- Select Existing Target or Add New --</option>
          {existingTargets.map((target) => (
            <option key={target.id} value={target.id}>
              {target.name} ({target.hosts})
            </option>
          ))}
          <option value="new">+ Add New Target</option>
        </select>
      </div>
      {/* {selectedTargetId === "new" && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            New Target Name
          </label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2 text-black"
            placeholder="Enter new target name"
            value={scanName}
            onChange={(e) => setScanName(e.target.value)}
          />
        </div>
      )} */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Scan Name</label>
        <input
          type="text"
          className="w-full rounded border px-3 py-2 text-black"
          placeholder="Enter scan name"
          value={scanName}
          onChange={(e) => setScanName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">IP Address</label>
        <input
          type="text"
          className="w-full rounded border px-3 py-2 text-black"
          placeholder="Enter IP address (e.g., 172.16.2.2)"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Schedule Time</label>
        <input
          type="datetime-local"
          className="w-full rounded border px-3 py-2 text-black"
          value={scheduleTime}
          onChange={(e) => setScheduleTime(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">
          Recurrence Interval (days)
        </label>
        <input
          type="number"
          className="w-full rounded border px-3 py-2 text-black"
          placeholder="Set recurrence interval in days"
          value={recurrenceDays}
          onChange={(e) => setRecurrenceDays(parseInt(e.target.value, 10))}
        />
        <small className="text-gray-500">
          Leave blank for one-time scheduling
        </small>
      </div>
      <div className="flex space-x-4">
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={planScan}
        >
          Schedule Scan
        </button>
        <button
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          onClick={runScanNow}
        >
          Run Now
        </button>
      </div>
      {feedback && <p className="mt-4 text-sm italic">{feedback}</p>}
    </div>
  );
};

export default function PlannerPage() {
  return (
    <div>
      <ScanPlanner />
      <TablePlanner />
    </div>
  );
}
