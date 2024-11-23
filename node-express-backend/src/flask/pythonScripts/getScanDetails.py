import sys
import json
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def get_scan_details(task_id):
    path = '/run/gvmd/gvmd.sock'  # Socket path
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'  # Replace with your username
    password = 'admin'  # Replace with your password

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            gmp.authenticate(username, password)

            # Get the task details for the provided task_id
            task_response = gmp.get_task(task_id=task_id)

            # Access attributes in XML
            start_date_element = task_response.find("first_report/report")
            start_date = start_date_element.get("date") if start_date_element is not None else "N/A"

            end_date_element = task_response.find("last_report/report")
            end_date = end_date_element.get("date") if end_date_element is not None else "N/A"

            # Create a dictionary with task details
            task_info = {
                "id": task_id,
                "name": task_response.findtext("name", default="N/A"),
                "status": task_response.findtext("status", default="N/A"),
                "progress": task_response.findtext("progress", default="N/A"),
                "owner": task_response.findtext("owner/name", default="N/A"),
                "comment": task_response.findtext("comment", default=""),
                "start_date": start_date,
                "end_date": end_date,
            }

            # Fetch the latest report for this task by filtering with task_id in filter_string
            report_response = gmp.get_reports(filter_string=f"task_id={task_id} sort-reverse=date rows=1")
            report = report_response.find("report")
            
            if report is not None:
                # Extract findings from the report
                results = []
                for result in report.findall(".//results/result"):
                    results.append({
                        "name": result.findtext("name", default="N/A"),
                        "severity": result.findtext("severity", default="N/A"),
                        "description": result.findtext("description", default="N/A"),
                        "host": result.findtext("host", default="N/A"),
                        "port": result.findtext("port", default="N/A"),
                    })

                # Add results to task_info
                task_info["results"] = results
            else:
                task_info["results"] = "No results available"

            return json.dumps(task_info)

    except GvmError as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 getScanDetails.py <task_id>")
        sys.exit(1)

    task_id = sys.argv[1]
    result = get_scan_details(task_id)
    print(result)  # This will output JSON-formatted data
