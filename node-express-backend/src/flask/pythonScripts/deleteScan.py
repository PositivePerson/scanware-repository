import sys
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def delete_scan(task_id):
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

            # Retrieve task details to check its status
            task_info = gmp.get_task(task_id=task_id)
            task_status = task_info.find('status').text if task_info.find('status') is not None else "unknown"

            # Stop the task if it is running before deletion
            if task_status == "Running":
                print(f"Task {task_id} is currently running. Stopping task before deletion.")
                stop_response = gmp.stop_task(task_id=task_id)
                stop_status = stop_response.find('status').text if stop_response.find('status') is not None else "unknown"
                print(f"Task {task_id} stop response status: {stop_status}")

                # Verify that the task was successfully stopped
                if stop_status != "200":
                    return {"error": f"Failed to stop task {task_id} before deletion. Stop response status: {stop_status}"}

            # Attempt to delete the task after stopping
            delete_response = gmp.delete_task(task_id=task_id)

            # Debug print all elements in delete_response
            # print("Debug: Full delete_response contents (iter):")
            # for element in delete_response.iter():
            #     print(f"{element.tag}: {element.text}")
            #     print(f"Full element {element}")

            # Check if the task still exists
            try:
                verify_response = gmp.get_task(task_id=task_id)
                if verify_response.find('task') is None:
                    return {"message": f"Task with ID {task_id} deleted successfully."}
                else:
                    return {"error": f"Task with ID {task_id} was not deleted successfully. It still exists."}
            except GvmError as verify_error:
                # Interpret 404 error as successful deletion
                if "404" in str(verify_error):
                    return {"message": f"Task with ID {task_id} deleted successfully."} # (confirmed by 404)

                # Return other errors as is
                return {"error": f"Failed to verify deletion. Error: {str(verify_error)}"}

    except GvmError as e:
        return {"error": str(e)}

if __name__ == '__main__':
    # Allow this script to be run directly
    if len(sys.argv) != 2:
        print("Usage: python3 deleteScan.py <task_id>")
        sys.exit(1)

    task_id = sys.argv[1]
    result = delete_scan(task_id)

    # Output the result
    if "error" in result:
        print(f"Error: {result['error']}")
    else:
        print(f"Success: {result['message']}")
