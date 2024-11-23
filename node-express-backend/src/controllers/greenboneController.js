const axios = require('axios');
const xml2js = require('xml2js'); // XML parsing library

// Define the base URL for the Flask API
const flaskBaseUrl = 'http://127.0.0.1:9391';

// Helper function for handling Flask requests with XML parsing
const requestFlask = async (url) => {
  try {
    const response = await axios.get(url);
    const xmlData = response.data;

    return new Promise((resolve, reject) => {
      xml2js.parseString(xmlData, (err, result) => {
        if (err) {
          reject('Error parsing XML');
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    throw new Error(error.message || 'Internal Server Error');
  }
};

// Controller functions
exports.getResults = async (req, res) => {
  try {
    const examples = "Well done";
    res.json(examples);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getVersion = async (req, res) => {
  try {
    const parsedData = await requestFlask(`${flaskBaseUrl}/version`);
    res.json({ flaskResponse: parsedData });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.getTest = async (req, res) => {
  res.json("Test works!");
};

exports.getTestFromAPI = async (req, res) => {
  try {
    const flaskResponse = await axios.get(`${flaskBaseUrl}/test`);
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.postStartScan = async (req, res) => {
  try {
    // target_name is scan name
    const { target_name, target_host } = req.body;

    // Check for both parameters
    if (!target_name || !target_host) {
      return res.status(400).json({ error: 'Missing target_name or target_host parameter' });
    }

    // Send POST request to Flask API
    const flaskResponse = await axios.post(`${flaskBaseUrl}/start-scan`, {
      target_name: target_name,
      target_host: target_host
    });

    // Respond with the data from Flask
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.postScheduleScan = async (req, res) => {
  try {
    const { task_name, schedule_time, ip } = req.body;

    // Check for required parameters
    if (!schedule_time || !ip) {
      return res.status(400).json({ error: 'Missing schedule_time or ip parameter' });
    }

    // Send POST request to Flask API
    const flaskResponse = await axios.post(`${flaskBaseUrl}/schedule-scan`, {
      task_name,
      schedule_time,
      ip
    });

    // Respond with the data from Flask
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.postCreateTarget = async (req, res) => {
  try {
    const { target_name, target_host } = req.body;

    // Check for required parameters
    if (!target_name || !target_host) {
      return res.status(400).json({ error: 'Missing target_name or target_host parameter' });
    }

    // Send POST request to Flask API
    const flaskResponse = await axios.post(`${flaskBaseUrl}/create-target`, {
      target_name,
      target_host
    });

    // Respond with the data from Flask
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.postResumeTask = async (req, res) => {
  try {
    const { task_id } = req.body;

    if (!task_id) {
      return res.status(400).json({ error: 'Missing task_id parameter' });
    }

    // Ensure endpoint matches exactly with Flask
    const flaskResponse = await axios.post(`${flaskBaseUrl}/resume-task`, {
      task_id
    });

    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    console.error("Error in postResumeTask:", error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.postRunAgainTask = async (req, res) => {
  try {
    const { task_id } = req.body;

    if (!task_id) {
      return res.status(400).json({ error: 'Missing task_id parameter' });
    }

    // Ensure endpoint matches exactly with Flask
    const flaskResponse = await axios.post(`${flaskBaseUrl}/run-again-task`, {
      task_id
    });

    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    console.error("Error in postRunAgainTask:", error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.postPauseTask = async (req, res) => {
  try {
    const { task_id } = req.body;

    if (!task_id) {
      return res.status(400).json({ error: 'Missing task_id parameter' });
    }

    // Ensure endpoint matches exactly with Flask
    const flaskResponse = await axios.post(`${flaskBaseUrl}/pause-task`, {
      task_id
    });

    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    console.error("Error in postPauseTask:", error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.getNotifyCompletion = async (req, res) => {
  const { task_id } = req.query;

  if (task_id) {
    console.log(`Received scan completion notification for scan ID: ${task_id}`);

    // Get the io instance from app
    const io = req.app.get('io');

    // Emit an event to all connected clients
    io.emit("scanComplete", { task_id, status: "completed" });

    res.status(200).json({ message: `Notification received for scan ID: ${task_id}` });
  } else {
    res.status(400).json({ error: 'task_id is required' });
  }
};

exports.getAggregates = async (req, res) => {
  try {
    // Send GET request to Flask API
    const flaskResponse = await axios.get(`${flaskBaseUrl}/get-aggregates`);

    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    console.error("Error in getAggregates:", error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.tasksBySeverity = async (req, res) => {
  try {
    // Send GET request to Flask API

    const flaskResponse = await axios.get(`${flaskBaseUrl}/tasks-by-severity`);
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    console.error("Error in tasksBySeverity:", error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.nvtBySeverities = async (req, res) => {
  try {
    // Send GET request to Flask API

    const flaskResponse = await axios.get(`${flaskBaseUrl}/nvt-by-severities`);
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    console.error("Error in nvtBySeverities:", error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.postScheduleRecurringScan = async (req, res) => {
  try {
    const { task_name, target_ip, start_date, recurrence_days } = req.body;

    // Validate required parameters
    if (!task_name || !target_ip || !start_date || !recurrence_days) {
      return res.status(400).json({ error: 'Missing required parameters: task_name, target_ip, start_date, or recurrence_days' });
    }

    // Send POST request to Flask API
    const flaskResponse = await axios.post(`${flaskBaseUrl}/schedule-recurring-scan`, {
      task_name,
      target_ip,
      start_date,
      recurrence_days
    });

    // Respond with the data from Flask
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    console.error("Error in postScheduleRecurringScan:", error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.getScanStatus = async (req, res) => {
  try {
    const taskId = req.query.taskId;
    if (!taskId) return res.status(400).json({ error: 'Missing taskId parameter' });

    const flaskResponse = await axios.get(`${flaskBaseUrl}/scan-status?task_id=${taskId}`);
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.getScanResult = async (req, res) => {
  try {
    const taskId = req.query.taskId;
    if (!taskId) return res.status(400).json({ error: 'Missing taskId parameter' });

    const flaskResponse = await axios.get(`${flaskBaseUrl}/scan-result?task_id=${taskId}`);
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const report_id = req.query.report_id;
    if (!report_id) {
      return res.status(400).json({ error: 'Missing report_id parameter' });
    }

    // Make the request to the Flask API
    const response = await axios.get(`${flaskBaseUrl}/download-report?report_id=${report_id}`, {
      responseType: 'arraybuffer' // Ensure response is in binary format for file download
    });

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report_${report_id}.pdf`);

    // Send the file content as a response
    res.send(response.data);
  } catch (error) {
    console.error("Error downloading report:", error);
    res.status(500).json({ error: 'Failed to download report', details: error.message });
  }
};

exports.getScanDetails = async (req, res) => {
  try {
    const taskId = req.query.taskId;
    if (!taskId) return res.status(400).json({ error: 'Missing taskId parameter' });

    const flaskResponse = await axios.get(`${flaskBaseUrl}/scan-details?task_id=${taskId}`);
    res.json(flaskResponse.data);
  } catch (error) {
    // Check if the error is from the Flask API
    if (error.response && error.response.data) {
      return res.status(error.response.status).json({
        error: error.response.data.error || 'Flask API Error',
        details: error.response.data,
      });
    }

    // General server error response
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

exports.getTargetScans = async (req, res) => {
  try {
    const targetId = req.query.targetId;
    if (!targetId) return res.status(400).json({ error: 'Missing targetId parameter' });

    const flaskResponse = await axios.get(`${flaskBaseUrl}/target-scans?target_id=${targetId}`);
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.getAllScans = async (req, res) => {
  try {
    const flaskResponse = await axios.get(`${flaskBaseUrl}/all-scans`);
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const flaskResponse = await axios.get(`${flaskBaseUrl}/get-schedules`);
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.getAllTargets = async (req, res) => {
  try {
    const flaskResponse = await axios.get(`${flaskBaseUrl}/all-targets`);
    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    console.log("error: ", error)
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.deleteScan = async (req, res) => {
  try {
    const { task_id } = req.body;

    // Check if task_id is provided
    if (!task_id) {
      return res.status(400).json({ error: 'Missing task_id parameter' });
    }

    console.log("Sending /delete-scan request to Flask API...");

    // Send DELETE request to Flask API
    const flaskResponse = await axios.delete(`${flaskBaseUrl}/delete-scan`, {
      headers: {
        'Content-Type': 'application/json' // Ensure content type is JSON
      },
      data: { task_id } // Ensure task_id is sent in the request body
    });

    console.log("Receiverd response  from /delete-scan Flask API: ", flaskResponse.data);

    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    console.log(" error: ", error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { schedule_id } = req.body;

    // Check if schedule_id is provided
    if (!schedule_id) {
      return res.status(400).json({ error: 'Missing schedule_id parameter' });
    }

    console.log("Sending /delete-schedule request to Flask API...");

    // Send DELETE request to Flask API
    const flaskResponse = await axios.delete(`${flaskBaseUrl}/delete-schedule`, {
      headers: {
        'Content-Type': 'application/json' // Ensure content type is JSON
      },
      data: { schedule_id } // Ensure schedule_id is sent in the request body
    });

    console.log("Receiverd response  from /delete-schedule Flask API: ", flaskResponse.data);

    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    console.log(" error: ", error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

exports.deleteTarget = async (req, res) => {
  try {
    const { target_id } = req.body;

    // Check if target_id is provided
    if (!target_id) {
      return res.status(400).json({ error: 'Missing target_id parameter' });
    }

    console.log("Sending /delete-target request to Flask API...");

    // Send DELETE request to Flask API
    const flaskResponse = await axios.delete(`${flaskBaseUrl}/delete-target`, {
      headers: {
        'Content-Type': 'application/json' // Ensure content type is JSON
      },
      data: { target_id } // Ensure target_id is sent in the request body
    });

    console.log("Received response from /delete-target Flask API: ", flaskResponse.data);

    res.json({ flaskResponse: flaskResponse.data });
  } catch (error) {
    console.log("Error in deleteTarget: ", error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
