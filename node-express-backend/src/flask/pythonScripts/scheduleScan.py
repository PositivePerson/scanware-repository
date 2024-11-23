import sys
from datetime import datetime
from gvm.connections import UnixSocketConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform
from gvm.errors import GvmError

def schedule_scan(task_name, ip, schedule_time):
    path = '/run/gvmd/gvmd.sock'  # Ensure the path is correct
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'
    password = 'admin'

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            # Authenticate with GVM
            print("Authenticating...")
            gmp.authenticate(username, password)
            print("Authenticated successfully.")

            # Step 1: Create or get the target
            print(f"Creating target with name: {task_name} and IP: {ip}")
            target = gmp.create_target(name=task_name, hosts=ip)
            target_id = target.get('id')
            print(f"Created target with ID: {target_id}")

            # Step 2: Define schedule time in GVM format (ISO 8601)
            print(f"Creating schedule for task '{task_name}' at time: {schedule_time}")
            schedule_response = gmp.create_schedule(
                name=f"{task_name} Schedule",
                first_run=schedule_time,
                period="86400"  # Repeat daily, adjust as needed
            )
            schedule_id = schedule_response.get('id')
            print(f"Created schedule with ID: {schedule_id}")

            # Step 3: Retrieve scan config ID
            print("Fetching scan configurations...")
            config = gmp.get_scan_configs().xpath("config[name='Full and fast']")
            if not config:
                print("Error: 'Full and fast' scan configuration not found", file=sys.stderr)
                return
            config_id = config[0].get("id")
            print(f"Using scan config ID: {config_id}")

            # Step 4: Create a scan task associated with the schedule and target
            print(f"Creating task '{task_name}' with target ID: {target_id} and schedule ID: {schedule_id}")
            task_response = gmp.create_task(name=task_name, config_id=config_id, target_id=target_id, schedule_id=schedule_id)
            print(f"Scheduled scan '{task_name}' for {ip} at {schedule_time}")
            print(f"Task response: {task_response}")

    except GvmError as e:
        print(f"An error occurred: {e}", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 scheduleScan.py <task_name> <ip> <schedule_time>")
        sys.exit(1)

    task_name = sys.argv[1]
    ip_address = sys.argv[2]
    schedule_time = sys.argv[3]  # Expected in ISO 8601 format, e.g., "2023-10-29T10:30:00Z"
    schedule_scan(task_name, ip_address, schedule_time)
