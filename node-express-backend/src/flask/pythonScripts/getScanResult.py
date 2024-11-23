import sys
import json
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform
from lxml import etree

def get_target_ip_from_task(gmp, task_id):
    """Retrieve the target IP address from the specified task's target."""
    try:
        # Retrieve the task information to get the target ID
        task_response = gmp.get_task(task_id=task_id)
        target_id = task_response.find(".//target").get("id")
        
        if not target_id:
            print("No target ID found for task", file=sys.stderr)
            return None
        
        # Retrieve target information using target ID
        target_response = gmp.get_target(target_id=target_id)
        
        # Debug: print target response to inspect XML structure
        # print("Target response XML:", etree.tostring(target_response, pretty_print=True).decode())
        
        # Extract target IP (hosts) from the target information
        target_ip = target_response.findtext(".//hosts")
        return target_ip if target_ip else None

    except Exception as e:
        print(f"Error retrieving target info: {e}", file=sys.stderr)
        return None

def get_scan_results(task_id):
    socket_path = '/run/gvmd/gvmd.sock'
    connection = UnixSocketConnection(path=socket_path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'  # Replace with actual credentials
    password = 'admin'  # Replace with actual credentials

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            # Authenticate with GVM
            gmp.authenticate(username, password)

            target_ip = get_target_ip_from_task(gmp, task_id)
            if not target_ip:
                return json.dumps({"status": "error", "message": "Target IP not found for task"})

            # Fetch results filtered by the target IP
            results_response = gmp.get_results(task_id=task_id, details=True, filter_string=f"rows=1000 host={target_ip}")
            results_list = parse_results(results_response)

            # Extracting filters, sort options, and result counts from the response
            filters = parse_filters(results_response)
            sort_options = parse_sort_options(results_response)
            result_counts = parse_result_counts(results_response)

            # Return results as a JSON string
            return json.dumps({
                "status": "success",
                "task_id": task_id,
                "target_ip": target_ip,
                "filters": filters,
                "sort": sort_options,
                "result_counts": result_counts,
                "results": results_list
            }, indent=2)

    except GvmError as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        return json.dumps({"status": "error", "error": str(e)})

def parse_results(results_response):
    results = []
    for result in results_response.xpath(".//result"):
        result_data = {
            "result_id": result.get("id"),
            "host": result.findtext("host", default="N/A"),
            "port": result.findtext("port", default="N/A"),
            "nvt_name": result.findtext("nvt/name", default="N/A"),
            "cvss_base": result.findtext("nvt/cvss_base", default="N/A"),
            "severity": result.findtext("severity", default="N/A"),
            "threat": result.findtext("threat", default="N/A"),
            "description": result.findtext("description", default="N/A"),
            "cve": [ref.get("id") for ref in result.findall("nvt/refs/ref[@type='cve']")]
        }
        results.append(result_data)
    return results

def parse_filters(results_response):
    filters = results_response.find(".//filters")
    if filters is not None:
        return {
            "id": filters.get("id", "0"),
            "term": filters.findtext("term", default="N/A"),
            "name": filters.findtext("name", default="N/A"),
            "keywords": [
                {
                    "column": kw.findtext("column", default="N/A"),
                    "relation": kw.findtext("relation", default="N/A"),
                    "value": kw.findtext("value", default="N/A"),
                }
                for kw in filters.findall("keywords/keyword")
            ]
        }
    return {}

def parse_sort_options(results_response):
    sort = results_response.find(".//sort")
    if sort is not None:
        field = sort.find("field")
        order = field.findtext("order", default="ascending") if field is not None else "ascending"
        return {
            "field": field.text if field is not None else "N/A",
            "order": order
        }
    return {}

def parse_result_counts(results_response):
    result_count = results_response.find(".//result_count")
    if result_count is not None:
        return {
            "filtered": result_count.findtext("filtered", default="0"),
            "page": result_count.findtext("page", default="0")
        }
    return {}

if __name__ == "__main__":
    # Ensure the task_id argument is provided
    if len(sys.argv) != 2:
        print(json.dumps({"status": "error", "error": "Missing task_id argument"}))
        sys.exit(1)

    task_id = sys.argv[1]
    result = get_scan_results(task_id)
    print(result)
