import sys
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def get_scan_status(task_id):
    path = '/run/gvmd/gvmd.sock'  # Socket path
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'  # Replace with your username
    password = 'admin'  # Replace with your password

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            # Authenticate with gvmd
            gmp.authenticate(username, password)

            # Get the task details for the provided task_id
            task_response = gmp.get_task(task_id=task_id)

            # Debug: Print the full task XML response to understand its structure
            print(task_response)

            # Parse the task status from the XML response using XPath
            task_status = task_response.xpath('//status')

            if task_status:
                return f"Task {task_id} status: {task_status[0].text}"
            else:
                return f"Task {task_id} does not have a status"

    except GvmError as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        return f"Error: {e}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 getScanStatus.py <task_id>")
        sys.exit(1)

    task_id = sys.argv[1]
    result = get_scan_status(task_id)
    print(result)
