from flask import Flask, request, jsonify, Response
import subprocess
import ipaddress
import json

app = Flask(__name__)

@app.route('/test', methods=['GET'])
def test():
    return "This is the /test endpoint."

@app.route('/version', methods=['GET'])
def run_script():
    script_path = '/gvm-tools/scripts/flask/pythonScripts/versionGetter.py'
    try:
        result = subprocess.run(['python3', script_path], capture_output=True, text=True, check=True)
        return jsonify({"version": result.stdout.strip()})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500

@app.route('/notify-nodejs', methods=['GET'])
def notify_completion():
    # Extract 'task_id' from query parameters
    task_id = request.args.get('task_id')

    if task_id:
        print(f"Received scan completion notification for task ID: {task_id}")
        
        # Define the path to the notifyNodejs.py script
        script_path = '/gvm-tools/scripts/flask/pythonScripts/notifyNodejs.py'
        
        try:
            # Run the notifyNodejs.py script with the task_id as an argument
            result = subprocess.run(['python3', script_path, task_id], capture_output=True, text=True, check=True)
            
            # Check if there is output from the script and return it in the response
            return jsonify({"output": result.stdout.strip()}), 200

        except subprocess.CalledProcessError as e:
            # If an error occurs in the subprocess, return the error output
            print(f"Error running notifyNodejs.py: {e.stderr}")
            return jsonify({"error": f"Script error: {e.stderr.strip()}"}), 500

    else:
        print("Task ID is missing in the notification request")
        # Return an error response if 'task_id' is not provided
        return jsonify({"error": "task_id is required"}), 400
    
@app.route('/start-scan', methods=['POST'])
def start_scan():
    # Get target details from the request body
    data = request.get_json()
    target_name = data.get('target_name', 'Default Target')
    target_host = data.get('target_host')

    # Validate that target_host is provided and is a single IP address
    if not target_host:
        return jsonify({"error": "Define host is required"}), 400

    try:
        ipaddress.ip_address(target_host)  # Validate IP address
    except ValueError:
        return jsonify({"error": "Invalid host format. Please provide a single valid IP address."}), 400

    # Run the startScan.py script with target_name and target_host
    script_path = '/gvm-tools/scripts/flask/pythonScripts/scanStarter.py'
    try:
        result = subprocess.run(
            ['python3', script_path, target_name, target_host],
            capture_output=True, text=True, check=True
        )
        output = result.stdout.strip()
        
        # Parse task_id from the script output
        if "task_id" in output:
            task_id = output.split("task_id: ")[1]
            handle_scan_completion(task_id)  # Pass task_id to completion handler
            return jsonify({"message": f"Scan started with task_id: {task_id}"})
        else:
            return jsonify({"error": "Failed to retrieve task ID"}), 500

    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500
    
def handle_scan_completion(task_id):
    script_path = '/gvm-tools/scripts/flask/pythonScripts/createCompletionAlert.py'

    try:
        result = subprocess.run(
            ['python3', script_path, task_id],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print("Error in subprocess:", result.stderr)
            return jsonify({"error": result.stderr}), 500

        return jsonify({"message": result.stdout})
    except Exception as e:
        print("An error occurred:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/schedule-scan', methods=['POST'])
def schedule_scan():
    data = request.json
    script_path = '/gvm-tools/scripts/flask/pythonScripts/scheduleScan.py'
    task_name = data.get('task_name')
    ip = data.get('ip')
    schedule_time = data.get('schedule_time')

    # Debugging logs
    print(f"script_path: {script_path}")
    print(f"task_name: {task_name}")
    print(f"ip: {ip}")
    print(f"schedule_time: {schedule_time}")

    # Check for any None values
    if not all([script_path, task_name, ip, schedule_time]):
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        result = subprocess.run(
            ['python3', script_path, task_name, ip, schedule_time],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print("Error in subprocess:", result.stderr)
            return jsonify({"error": result.stderr}), 500

        return jsonify({"message": result.stdout})
    except Exception as e:
        print("An error occurred:", e)
        return jsonify({"error": str(e)}), 500
    
@app.route('/create-target', methods=['POST'])
def create_target():
    data = request.json
    script_path = '/gvm-tools/scripts/flask/pythonScripts/createTarget.py'
    target_name = data.get('target_name')
    target_host = data.get('target_host')

    # Check for required parameters
    if not target_name or not target_host:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        result = subprocess.run(
            ['python3', script_path, target_name, target_host],
            capture_output=True,
            text=True
        )
        
        # Debugging logs
        print("Subprocess STDOUT:", result.stdout)
        print("Subprocess STDERR:", result.stderr)

        # Check the result of the subprocess
        if result.returncode != 0:
            return jsonify({"error": "Failed to create target", "details": result.stderr.strip()}), 500

        # Check for success message
        if "Target created successfully" in result.stdout:
            target_id = result.stdout.split("ID: ")[-1].strip()
            return jsonify({"message": "Target created successfully", "target_id": target_id}), 201
        else:
            return jsonify({"error": "Unexpected response from target creation script", "details": result.stdout}), 500

    except Exception as e:
        print("An error occurred in the Flask route:", e)
        return jsonify({"error": str(e)}), 500
    
@app.route('/schedule-recurring-scan', methods=['POST'])
def schedule_recurring_scan():
    data = request.json
    script_path = '/gvm-tools/scripts/flask/pythonScripts/createRecurringSchedule.py'
    
    task_name = data.get('task_name')
    target_ip = data.get('target_ip')
    start_date = data.get('start_date')
    recurrence_days = data.get('recurrence_days', 3)  # Default to every 3 days if not provided

    # Check for required parameters
    if not all([task_name, target_ip, start_date]):
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        result = subprocess.run(
            ['python3', script_path, task_name, target_ip, start_date, str(recurrence_days)],
            capture_output=True,
            text=True
        )

        # Debugging logs
        print("Subprocess STDOUT:", result.stdout)
        print("Subprocess STDERR:", result.stderr)

        # Check the result of the subprocess
        if result.returncode != 0:
            return jsonify({"error": "Failed to create recurring schedule", "details": result.stderr.strip()}), 500

        return jsonify({"message": "Recurring schedule created successfully", "details": result.stdout.strip()}), 201

    except Exception as e:
        print("An error occurred in the Flask route:", e)
        return jsonify({"error": str(e)}), 500
    
@app.route('/resume-task', methods=['POST'])
def post_resume_task():
    data = request.json
    task_id = data.get('task_id')

    if not task_id:
        return jsonify({"error": "Missing task_id parameter"}), 400

    try:
        result = subprocess.run(
            ['python3', '/gvm-tools/scripts/flask/pythonScripts/postResumeTask.py', task_id],
            capture_output=True,
            text=True
        )
        
        # Check for subprocess success
        if result.returncode == 0:
            return jsonify(json.loads(result.stdout))
        else:
            return jsonify(json.loads(result.stderr)), 500

    except Exception as e:
        return jsonify({"error": str(e), "details": "Failed to resume scan"}), 500
    
@app.route('/run-again-task', methods=['POST'])
def post_run_again_task():
    data = request.json
    task_id = data.get('task_id')

    if not task_id:
        return jsonify({"error": "Missing task_id parameter"}), 400

    try:
        result = subprocess.run(
            ['python3', '/gvm-tools/scripts/flask/pythonScripts/postRunAgainTask.py', task_id],
            capture_output=True,
            text=True
        )
        
        # Check for subprocess success
        if result.returncode == 0:
            return jsonify(json.loads(result.stdout))
        else:
            return jsonify(json.loads(result.stderr)), 500

    except Exception as e:
        return jsonify({"error": str(e), "details": "Failed to run-again scan"}), 500
    
@app.route('/pause-task', methods=['POST'])
def pause_task():
    # Retrieve the task_id from the request body
    data = request.get_json()
    task_id = data.get('task_id')

    if not task_id:
        return jsonify({"error": "Missing task_id"}), 400

    # Path to the pauseTask.py script
    script_path = '/gvm-tools/scripts/flask/pythonScripts/postPauseTask.py'

    try:
        # Execute the pauseTask.py script with task_id as an argument
        result = subprocess.run(
            ['python3', script_path, task_id],
            capture_output=True, text=True, check=True
        )

        # Capture stdout or, if empty, stderr
        output = result.stdout.strip() or result.stderr.strip()
        return jsonify({"pause_task": output})

    except subprocess.CalledProcessError as e:
        # Capture detailed error information
        return jsonify({"error": e.stderr.strip()}), 500

@app.route('/scan-status', methods=['GET'])
def scan_status():
    task_id = request.args.get('task_id')
    if not task_id:
        return jsonify({"error": "Missing task_id"}), 400

    script_path = '/gvm-tools/scripts/flask/pythonScripts/getScanStatus.py'
    try:
        result = subprocess.run(['python3', script_path, task_id], capture_output=True, text=True, check=True)
        return jsonify({"status": result.stdout.strip()})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500

@app.route('/download-report', methods=['GET'])
def download_report():
    report_id = request.args.get('report_id')
    if not report_id:
        return jsonify({"error": "Missing report_id"}), 400

    script_path = '/gvm-tools/scripts/flask/pythonScripts/getReport.py'
    try:
        result = subprocess.run(
            ['python3', script_path, report_id],
            capture_output=True, text=True, check=True
        )
        # Send the report content as a file download
        return Response(
            result.stdout,
            mimetype="application/pdf",
            headers={"Content-Disposition": f"attachment;filename=report_{report_id}.pdf"}
        )
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500
    
@app.route('/scan-details', methods=['GET'])
def scan_details():
    task_id = request.args.get('task_id')
    if not task_id:
        return jsonify({"error": "Missing task_id"}), 400

    script_path = '/gvm-tools/scripts/flask/pythonScripts/getScanDetails.py'
    try:
        result = subprocess.run(['python3', script_path, task_id], capture_output=True, text=True, check=True)
        
        # Parse JSON from the subprocess result
        try:
            scan_details = json.loads(result.stdout.strip())  # Ensure output is treated as JSON
        except json.JSONDecodeError:
            return jsonify({"error": "Failed to parse scan details as JSON", "output": result.stdout.strip()}), 500

        return jsonify(scan_details)  # Return JSON response
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500

@app.route('/target-scans', methods=['GET'])
def target_scans():
    target_id = request.args.get('target_id')
    if not target_id:
        return jsonify({"error": "Missing target_id"}), 400

    script_path = '/gvm-tools/scripts/flask/pythonScripts/getTargetScans.py'
    try:
        result = subprocess.run(['python3', script_path, target_id], capture_output=True, text=True, check=True)
        return jsonify({"target_scans": result.stdout.strip()})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500

@app.route('/all-scans', methods=['GET'])
def all_scans():
    script_path = '/gvm-tools/scripts/flask/pythonScripts/getAllScans.py'
    try:
        result = subprocess.run(['python3', script_path], capture_output=True, text=True, check=True)
        return jsonify({"all_scans": result.stdout.strip()})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500
    
@app.route('/get-aggregates', methods=['GET'])
def get_aggregates():
    script_path = '/gvm-tools/scripts/flask/pythonScripts/getAggregates.py'
    try:
        result = subprocess.run(['python3', script_path], capture_output=True, text=True, check=True)
        return jsonify({"get_aggregates": result.stdout.strip()})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500
    
@app.route('/tasks-by-severity', methods=['GET'])
def tasks_by_severity():
    script_path = '/gvm-tools/scripts/flask/pythonScripts/tasksBySeverity.py'
    try:
        result = subprocess.run(['python3', script_path], capture_output=True, text=True, check=True)
        return jsonify({"tasks_by_severity": result.stdout.strip()})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500
    
@app.route('/nvt-by-severities', methods=['GET'])
def nvt_by_severities():
    script_path = '/gvm-tools/scripts/flask/pythonScripts/nvtBySeverities.py'
    try:
        result = subprocess.run(['python3', script_path], capture_output=True, text=True, check=True)
        return jsonify({"nvt_by_severities": result.stdout.strip()})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500
    
@app.route('/get-schedules', methods=['GET'])
def get_schedules():
    script_path = '/gvm-tools/scripts/flask/pythonScripts/getSchedules.py'
    try:
        result = subprocess.run(['python3', script_path], capture_output=True, text=True, check=True)
        return jsonify({"get_schedules": result.stdout.strip()})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500

# @app.route('/scans/<scanId>', methods=['GET'])
# def get_scan_results(scanId):
#     """
#     Endpoint to fetch scan results for a given scan ID.
#     """
#     # Connection and transformation setup
#     connection = UnixSocketConnection(path=socket_path)
#     transform = EtreeCheckCommandTransform()

#     try:
#         with Gmp(connection=connection, transform=transform) as gmp:
#             # Replace 'admin' and 'password' with appropriate credentials
#             gmp.authenticate('admin', 'password')

#             # Set up filters and fetch results for the specific task/scan ID
#             results_response = gmp.get_results(
#                 filter=f"task_id={scanId}",
#                 details=True  # Fetch detailed results
#             )

#             # Parse results
#             results = []
#             for result in results_response.xpath(".//result"):
#                 result_data = {
#                     "result_id": result.get("id"),
#                     "host": result.findtext("host"),
#                     "port": result.findtext("port", default="N/A"),
#                     "nvt_name": result.find("nvt/name").text if result.find("nvt/name") is not None else "N/A",
#                     "cvss_base": result.find("nvt/cvss_base").text if result.find("nvt/cvss_base") is not None else "N/A",
#                     "severity": result.findtext("severity"),
#                     "threat": result.findtext("threat"),
#                     "description": result.findtext("description"),
#                     "cve": [ref.get("id") for ref in result.findall("nvt/refs/ref[@type='cve']")]
#                 }
#                 results.append(result_data)

#             # Return as JSON response
#             return jsonify({"status": "success", "scanId": scanId, "results": results})

#     except Exception as e:
#         print(f"Error fetching results: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/scan-result', methods=['GET'])
def scan_result():
    task_id = request.args.get('task_id')
    if not task_id:
        return jsonify({"error": "Missing task_id"}), 400

    script_path = '/gvm-tools/scripts/flask/pythonScripts/getScanResult.py'
    try:
        result = subprocess.run(['python3', script_path, task_id], capture_output=True, text=True, check=True)
        return jsonify({"scan_result": result.stdout.strip()})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500

@app.route('/all-targets', methods=['GET'])
def all_targets():
    script_path = '/gvm-tools/scripts/flask/pythonScripts/getAllTargets.py'
    try:
        result = subprocess.run(['python3', script_path], capture_output=True, text=True, check=True)
        return jsonify({"all_targets": result.stdout.strip()})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr.strip()}), 500
    
@app.route('/delete-target', methods=['DELETE'])
def delete_target():
    # Retrieve the target_id from the request body
    data = request.get_json()
    target_id = data.get('target_id')

    if not target_id:
        return jsonify({"error": "Missing target_id"}), 400

    # Path to the deleteTarget.py script
    script_path = '/gvm-tools/scripts/flask/pythonScripts/deleteTarget.py'
    
    try:
        # Execute the deleteTarget.py script with target_id as an argument
        result = subprocess.run(
            ['python3', script_path, target_id],
            capture_output=True, text=True, check=True
        )
        
        # Return the script's output in the JSON response
        return jsonify({"delete_target": result.stdout.strip()})

    except subprocess.CalledProcessError as e:
        # Capture detailed error information
        return jsonify({"error": e.stderr.strip()}), 500
    
@app.route('/delete-schedule', methods=['DELETE'])
def delete_schedule():
    # Retrieve the schedule_id and optional 'ultimate' flag from the request body
    data = request.get_json()
    schedule_id = data.get('schedule_id')
    ultimate = data.get('ultimate', False)

    if not schedule_id:
        return jsonify({"error": "Missing schedule_id"}), 400

    # Path to the deleteSchedule.py script
    script_path = '/gvm-tools/scripts/flask/pythonScripts/deleteSchedule.py'

    try:
        # Run the deleteSchedule.py script with schedule_id and ultimate as arguments
        result = subprocess.run(
            ['python3', script_path, schedule_id, str(ultimate)],
            capture_output=True, text=True, check=True
        )
        
        # Return the script's output in the JSON response
        return jsonify({"delete_schedule": result.stdout.strip()})

    except subprocess.CalledProcessError as e:
        # Capture detailed error information
        return jsonify({"error": e.stderr.strip()}), 500
    
@app.route('/delete-scan', methods=['DELETE'])
def delete_scan():
    # Get task_id details from the request body
    data = request.get_json()
    print(f"Debug: data: ", data)
    task_id = data.get('task_id')
    print(f"Debug: Received task_id: {task_id}")

    # Validate that task_id is provided
    if not task_id:
        print("Debug: Missing task_id in request")
        return jsonify({"error": "Missing task_id"}), 400

    script_path = '/gvm-tools/scripts/flask/pythonScripts/deleteScan.py'
    
    try:
        # Execute the deleteScan.py script with task_id as an argument
        print(f"Debug: Running script {script_path} with task_id {task_id}")
        result = subprocess.run(
            ['python3', script_path, task_id],
            capture_output=True, text=True, check=True
        )

        # Debugging output
        print(f"Debug: Script executed successfully")
        print(f"Script stdout: {result.stdout}")
        print(f"Script stderr: {result.stderr}")
        print(f"Return code: {result.returncode}")

        # Return the script's output in the JSON response
        return jsonify({"delete_scan": result.stdout.strip()})

    except subprocess.CalledProcessError as e:
        # Capture detailed error information
        print(f"Error running deleteScan.py: {e}")
        print(f"Script stderr: {e.stderr.strip()}")
        print(f"Return code: {e.returncode}")
        print(f"Debug: Command run was: {' '.join(e.cmd)}")

        return jsonify({"error": e.stderr.strip(), "details": f"Return code: {e.returncode}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9391, debug=True)
