import sys
from gvm.connections import UnixSocketConnection
from gvm.protocols.gmp import Gmp
from gvm.errors import GvmError
from gvm.transforms import EtreeCheckCommandTransform

# Alert configurations
# ALERT_NAME = "Scan Completion Alert"
NODEJS_URL = "http://localhost:4000/api/greenbone/notify-completion-from-api"  # Replace with actual URL

def create_scan_completion_alert():
    # Establish connection to GVM
    connection = UnixSocketConnection(path='/run/gvmd/gvmd.sock')
    transform = EtreeCheckCommandTransform()

    # Authenticate and create alert within Gmp context
    with Gmp(connection=connection, transform=transform) as gmp:
        gmp.authenticate('admin', 'admin')  # Use your actual username and password

        try:
            # Define event and method data for alert
            event_data = {"status": "Done"}
            method_data = {"url": NODEJS_URL}

            # Create the alert
            response = gmp.create_alert(
                name="Scan Completion Alert with task name",
                comment="Triggers when a scan task completes",
                condition=gmp.types.AlertCondition.ALWAYS,
                event=gmp.types.AlertEvent.TASK_RUN_STATUS_CHANGED,
                event_data=event_data,
                method=gmp.types.AlertMethod.HTTP_GET,
                # method_data=method_data
                method_data={
                    "URL": "http://localhost:4000/api/greenbone/notify-completion-from-api?task_id=$n"
                }
            )

            # Get alert ID and print it
            alert_id = response.get('id')
            print(f"Alert created successfully with ID: {alert_id}")
            return alert_id

        except GvmError as e:
            print(f"An error occurred while creating the alert: {e}")
            return None

if __name__ == '__main__':
    # if len(sys.argv) != 2:
    #     print("Usage: python3 createCompletionAlert.py <task_id>")
    #     sys.exit(1)
    
    # task_id = sys.argv[1]
    # alert_id = create_scan_completion_alert(task_id)
    alert_id = create_scan_completion_alert()
    if alert_id:
        print(f"Alert created with ID: {alert_id}")
    else:
        print("Failed to create alert")
