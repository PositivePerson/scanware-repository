# stopTask.py
import sys
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def stop_task(task_id):
    if not task_id:
        return {"error": "Missing task_id"}

    try:
        # Connect to GVM
        connection = UnixSocketConnection(path='/run/gvmd/gvmd.sock')
        transform = EtreeCheckCommandTransform()

        username = 'admin'
        password = 'admin'

        with Gmp(connection=connection, transform=transform) as gmp:
            gmp.authenticate(username, password)

            # Attempt to stop the running task
            stop_response = gmp.stop_task(task_id=task_id)
            status = stop_response.get("status")
            status_text = stop_response.get("status_text")

            # Check for successful stop
            if status == "200":
                print(f"Task with ID {task_id} stopped successfully.")
            else:
                print(f"Failed to stop task. Status: {status}. Message: {status_text}")

    except GvmError as e:
        print(f"Error: {str(e)}")

if __name__ == '__main__':
    # Allow this script to be run directly
    if len(sys.argv) != 2:
        print("Usage: python3 stopTask.py <task_id>")
        sys.exit(1)

    task_id = sys.argv[1]
    stop_task(task_id)
