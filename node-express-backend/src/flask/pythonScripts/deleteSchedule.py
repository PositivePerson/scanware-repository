import sys
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def delete_schedule(schedule_id, ultimate=False):
    if not schedule_id:
        print("Error: Missing schedule_id")
        return {"error": "Missing schedule_id"}

    try:
        # Connect to GVM
        print("Attempting to connect to GVM...")
        connection = UnixSocketConnection(path='/run/gvmd/gvmd.sock')
        transform = EtreeCheckCommandTransform()

        username = 'admin'
        password = 'admin'

        with Gmp(connection=connection, transform=transform) as gmp:
            print("Connection established. Authenticating...")
            gmp.authenticate(username, password)
            print("Authentication successful.")

            try:
                # Attempt to delete the schedule
                print(f"Attempting to delete schedule with ID {schedule_id}...")
                delete_response = gmp.delete_schedule(schedule_id=schedule_id, ultimate=ultimate)
                
                # Accessing the status and status_text
                status = delete_response.get("status")
                status_text = delete_response.get("status_text")

                # Debugging output for the response
                print(f"Received delete response: status={status}, status_text={status_text}")

                # Check for successful deletion
                if status == "200":
                    print(f"Schedule with ID {schedule_id} deleted successfully.")
                    return {"success": True, "message": f"Schedule with ID {schedule_id} deleted successfully."}
                else:
                    print(f"Failed to delete schedule. Status: {status}. Message: {status_text}")
                    return {"success": False, "error": f"Failed to delete schedule. Status: {status}. Message: {status_text}"}

            except GvmError as delete_error:
                print(f"Error during deletion attempt: {str(delete_error)}")
                return {"success": False, "error": f"Error during deletion attempt: {str(delete_error)}"}

    except GvmError as e:
        print(f"Error: Unable to connect or authenticate with GVM. Details: {str(e)}")
        return {"success": False, "error": f"Unable to connect or authenticate with GVM. Details: {str(e)}"}

if __name__ == '__main__':
    # Allow this script to be run directly
    if len(sys.argv) < 2:
        print("Usage: python3 deleteSchedule.py <schedule_id> [<ultimate>]")
        sys.exit(1)

    schedule_id = sys.argv[1]
    ultimate = sys.argv[2].lower() == 'true' if len(sys.argv) > 2 else False
    delete_schedule(schedule_id, ultimate=ultimate)
