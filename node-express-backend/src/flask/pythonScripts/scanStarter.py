import sys
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def start_scan(target_name, target_host):
    path = '/run/gvmd/gvmd.sock'  # Path to Unix socket
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'  # Replace with your actual username
    password = 'admin'  # Replace with your actual password

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            # Authenticate with GVM
            gmp.authenticate(username, password)

            # Step 1: Get the available port list and choose one
            port_lists = gmp.get_port_lists()
            port_list_id = None
            for port_list in port_lists.xpath('port_list'):
                port_list_name = port_list.find('name').text
                if port_list_name == "All IANA assigned TCP":
                    port_list_id = port_list.get('id')
                    break

            if not port_list_id:
                return "Error: Could not find a valid port list"

            # Step 2: Retrieve all targets to manually check for an exact match on hosts
            print(f"Checking for an exact match with hosts: {target_host}")
            all_targets = gmp.get_targets()
            target_id = None

            for target in all_targets.xpath('target'):
                retrieved_hosts = target.find('hosts').text
                retrieved_id = target.get('id')
                
                # Compare the hosts directly
                if retrieved_hosts == target_host:
                    target_id = retrieved_id
                    print(f"Reusing existing target with exact hosts '{target_host}' and ID: {target_id}")
                    break

            # Step 3: Only check by name if no target with exact hosts was found
            if not target_id:
                print(f"No exact host match found. Checking for existing target by name: {target_name}")
                existing_target_name = gmp.get_targets(filter_string=f"name={target_name}")
                if existing_target_name.xpath('target'):
                    target_id = existing_target_name.xpath('target')[0].get('id')
                    print(f"Reusing existing target with name '{target_name}' and ID: {target_id}")

            # Step 4: If neither hosts nor name matches, create a new target
            if not target_id:
                print(f"No existing target found. Creating a new target with name '{target_name}' and hosts '{target_host}'.")
                target_response = gmp.create_target(name=target_name, hosts=target_host, port_list_id=port_list_id)
                target_id = target_response.get('id')
                print(f"New target created with ID: {target_id}")

            task_name = target_name

            # Step 5: Get scan configurations and select "Full and fast" config
            scan_configs = gmp.get_scan_configs()
            config_id = None
            for config in scan_configs.xpath('config'):
                config_name = config.find('name').text
                print(f"Available scan config: {config_name}")
                if config_name == "Full and fast":
                    config_id = config.get('id')
                    print(f"Selected scan configuration: {config_name} with ID: {config_id}")
                    break

            if not config_id:
                return "Error: Could not find a valid scan config"

            # Step 6: Get the available scanners and choose the "OpenVAS Default Scanner"
            print("Fetching available scanners...")
            scanners = gmp.get_scanners()
            scanner_id = None
            for scanner in scanners.xpath('scanner'):
                scanner_name = scanner.find('name').text
                print(f"Available scanner: {scanner_name}")
                if scanner_name == "OpenVAS Default":
                    scanner_id = scanner.get('id')
                    print(f"Selected scanner: {scanner_name} with ID: {scanner_id}")
                    break

            if not scanner_id:
                return "Error: Could not find a valid scanner"

            # Step 7: Retrieve or create "Done" alerts
            alert_ids = []
            alerts = gmp.get_alerts()
            for alert in alerts.xpath("alert"):
                alert_ids.append(alert.get("id"))

            # If no "Done" alert exists, create a new alert for "Done" condition
            if not alert_ids:
                event_data = {"status": "Done"}
                alert_url = "http://192.168.0.160:4000/api/greenbone/notify-completion-from-api?task_id=$n" # todo: replace IP address to nodejs actual IP
                new_alert = gmp.create_alert(
                    name="Scan Completion Alert with task name",
                    comment="Triggers when a scan task completes",
                    condition=gmp.types.AlertCondition.ALWAYS,
                    event=gmp.types.AlertEvent.TASK_RUN_STATUS_CHANGED,
                    event_data=event_data,
                    method=gmp.types.AlertMethod.HTTP_GET,
                    # url=alert_url
                    method_data={
                        "url": alert_url  # todo: Update to actual URL
                    }
                )
                alert_ids.append(new_alert.get("id"))
                print(f"New alert created with ID: {new_alert.get('id')}")

            # Step 8: Create a scan task with the selected configuration, scanner, and alerts
            print(f"Creating task '{task_name}' for target ID {target_id}...")
            task_response = gmp.create_task(
                name=task_name,
                target_id=target_id,
                config_id=config_id,
                scanner_id=scanner_id,
                alert_ids=alert_ids  
            )
            task_id = task_response.get('id')
            print(f"Task created with ID: {task_id}")

            # Step 9: Start the scan task
            print(f"Starting task with ID: {task_id}...")
            gmp.start_task(task_id)
            print(f"Task {task_id} started successfully.")

            return f"Scan started for task_id: {task_id}, target_id: {target_id}"

    except GvmError as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        return f"Error: {e}"

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 scanStarter.py <target_name> <target_host>")
        sys.exit(1)

    target_name = sys.argv[1]
    target_host = sys.argv[2]
    result = start_scan(target_name, target_host)
    print(result)
