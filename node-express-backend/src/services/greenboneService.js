const axios = require('axios');
const xml2js = require('xml2js');

const GVM_USERNAME = 'admin'; // Your GVM username
const GVM_PASSWORD = 'YourPasswordHere'; // Your GVM password
// const GVM_HOST = 'http://localhost'; // Or container IP if different
const GVM_HOST = 'http://127.0.0.1';
// const GVM_PORT = 9390; // Default port for GVM
const GVM_PORT = 8080; // Default port for GVM

// Function to authenticate with the GVM API
async function authenticate() {
    const xml = `
    <authenticate>
      <credentials>
        <username>${GVM_USERNAME}</username>
        <password>${GVM_PASSWORD}</password>
      </credentials>
    </authenticate>
  `;

    const response = await sendRequest(xml);
    const sessionId = await parseXML(response, 'authenticate_response/session');
    return sessionId;
}

// Function to create a target (specifying what to scan)
async function createTarget(sessionId, targetName, targetHosts) {
    const xml = `
    <create_target>
      <name>${targetName}</name>
      <hosts>${targetHosts}</hosts>
      <session>${sessionId}</session>
    </create_target>
  `;
    const response = await sendRequest(xml);
    const targetId = await parseXML(response, 'create_target_response/id');
    return targetId;
}

// Function to create and start a scan task
async function createTask(sessionId, taskName, configId, targetId) {
    const xml = `
    <create_task>
      <name>${taskName}</name>
      <config id="${configId}" />
      <target id="${targetId}" />
      <session>${sessionId}</session>
    </create_task>
  `;
    const response = await sendRequest(xml);
    const taskId = await parseXML(response, 'create_task_response/id');
    return taskId;
}

// Function to start a scan task
async function startTask(sessionId, taskId) {
    const xml = `
    <start_task task_id="${taskId}">
      <session>${sessionId}</session>
    </start_task>
  `;
    const response = await sendRequest(xml);
    return response;
}

// Function to send the raw XML request to the GVM API
async function sendRequest(xml) {
    try {
        const response = await axios.post(
            `${GVM_HOST}:${GVM_PORT}/gvm`, // GVM API URL
            xml,
            {
                headers: {
                    'Content-Type': 'application/xml',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error sending request to GVM:', error);
    }
}

// Function to parse XML response and extract the desired field
async function parseXML(xml, field) {
    let parsedData;
    await xml2js.parseStringPromise(xml, { explicitArray: false })
        .then(result => {
            parsedData = result[field];
        })
        .catch(err => {
            console.error('Error parsing XML:', err);
        });
    return parsedData;
}

// Function to export that triggers the entire scan process
exports.makeScan = async (targetName, targetHost) => {
    try {
        // Authenticate and get session ID
        const sessionId = await authenticate();
        console.log('Authenticated. Session ID:', sessionId);

        // Create a target
        const targetId = await createTarget(sessionId, targetName, targetHost);
        console.log('Created Target. Target ID:', targetId);

        // Create a task with the default scan config ID (adjust the config ID as needed)
        const configId = 'daba56c8-73ec-11df-a475-002264764cea'; // Example Full and Fast Scan Config
        const taskId = await createTask(sessionId, 'My Scan Task', configId, targetId);
        console.log('Created Task. Task ID:', taskId);

        // Start the scan task
        const startResponse = await startTask(sessionId, taskId);
        console.log('Started Scan Task. Response:', startResponse);

        return { taskId, targetId, startResponse };
    } catch (error) {
        console.error('Error running scan:', error);
        throw error;
    }
};
