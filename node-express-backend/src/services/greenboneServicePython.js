// Function to export that triggers the entire scan process
exports.makeScan = async (targetName, targetHost) => {
    try {
        const { spawn } = require('child_process');
        const pyProg = spawn('python', ['./../pythonScripts/versionGetter.py']);

        pyProg.stdout.on('data', function (data) {

            console.log(data.toString());
            // res.write(data);
            // res.end('end');
            return data;
        });

        // // Start the scan task
        // const startResponse = await startTask(sessionId, taskId);
        // console.log('Started Scan Task. Response:', startResponse);

        // return { taskId, targetId, startResponse };
    } catch (error) {
        console.error('Error running scan:', error);
        throw error;
    }
};
