import sys
import base64
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def download_report(report_id, format_id="a3810a62-1f62-11e1-9219-406186ea4fc5"):  # Example format for TXT or XML
    path = '/run/gvmd/gvmd.sock'  # Path to Unix socket
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'  # Replace with your credentials
    password = 'admin'

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            gmp.authenticate(username, password)

            # Get the report in the specified format
            report_response = gmp.get_report(report_id=report_id, report_format_id=format_id)
            report_element = report_response.find("report")
            
            if report_element is not None:
                report_data_base64 = report_element.text  # Retrieve Base64 content from XML

                # Decode from Base64 to binary data
                report_data = base64.b64decode(report_data_base64)

                # Define the path to save the report
                output_path = f"/tmp/report_{report_id}.pdf"

                # Save the report to a file in binary mode
                with open(output_path, "wb") as report_file:
                    report_file.write(report_data)

                print(f"Report saved to {output_path}")
                return output_path
            else:
                print("No report data found.")
                return None

    except GvmError as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 download_report.py <report_id>")
        sys.exit(1)

    report_id = sys.argv[1]
    result = download_report(report_id)
    if result:
        print(f"Report successfully downloaded at: {result}")
