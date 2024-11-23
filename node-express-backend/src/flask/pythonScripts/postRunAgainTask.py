import sys
import json
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def post_run_again_task(task_id):
    path = '/run/gvmd/gvmd.sock'  # Replace with the actual socket path
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'  # Replace with actual username
    password = 'admin'  # Replace with actual password

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            # Authenticate with GVM
            gmp.authenticate(username, password)
            
            # Attempt to run_again the stopped task
            gmp.start_task(task_id=task_id)
            print(json.dumps({"message": "Scan run_againd successfully"}))
            return  # Exit the function after successful run_again

    except GvmError as e:
        error_message = f"An error occurred: {e}"
        print(json.dumps({"error": error_message, "details": "Failed to run_again scan"}), file=sys.stderr)
        sys.exit(1)  # Exit with a non-zero status to indicate failure

# Main entry point for command-line testing
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 postrun_againTask.py <task_id>")
        sys.exit(1)
    
    task_id = sys.argv[1]
    post_run_again_task(task_id)
