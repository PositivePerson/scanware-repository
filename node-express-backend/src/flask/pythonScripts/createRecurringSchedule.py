import sys
import pytz
from datetime import datetime
from icalendar import Calendar, Event
from gvm.connections import UnixSocketConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform
from gvm.errors import GvmError

def create_recurring_schedule(task_name, ip, start_date, recurrence_days):
    path = '/run/gvmd/gvmd.sock'  # Ensure this is your Unix socket path
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'
    password = 'admin'

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            # Authenticate with GVM
            gmp.authenticate(username, password)

            # Create the Calendar event for the recurring schedule
            cal = Calendar()
            cal.add('prodid', '-//Greenbone Schedule//')
            cal.add('version', '2.0')

            # Define the event start time and recurrence rule
            event = Event()
            event.add('dtstamp', datetime.now(tz=pytz.UTC))
            
            # Adjust start_date parsing to handle UTC indicator `Z`
            if start_date.endswith("Z"):
                dt_start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            else:
                dt_start = datetime.fromisoformat(start_date)
            
            event.add('dtstart', dt_start)
            event.add('rrule', {
                'freq': 'DAILY',
                'interval': recurrence_days  # Every `recurrence_days`
            })

            # Add the event to the calendar
            cal.add_component(event)

            # Create the schedule in GMP
            schedule = gmp.create_schedule(
                name=f"{task_name} - Every {recurrence_days} days",
                icalendar=cal.to_ical().decode('utf-8'),  # Convert to string
                timezone='CET'
            )

            schedule_id = schedule.get('id')
            print(f"Schedule created with ID: {schedule_id}")

            # Retrieve the target ID by matching on the IP address
            targets = gmp.get_targets()
            target_id = None
            for target in targets.xpath("target"):
                if target.find("hosts").text == ip:
                    target_id = target.get("id")
                    break
            
            if not target_id:
                raise ValueError(f"Target with IP {ip} not found.")
            
            # Retrieve port list ID
            port_list_id = "33d0cd82-57c6-11e1-8ed1-406186ea4fc5"  # All IANA assigned TCP

            # Retrieve scan config ID
            scan_configs = gmp.get_scan_configs().xpath("config[name='Full and fast']")
            if not scan_configs:
                raise ValueError("Scan config 'Full and fast' not found.")
            config_id = scan_configs[0].get("id")

            # Use the default scanner ID for OpenVAS
            scanner_id = "08b69003-5fc2-4037-a479-93b440211c73"  # Default OpenVAS scanner ID

            # Check for existing alerts with "Done" condition
            alert_ids = []
            existing_alerts = gmp.get_alerts()
            for alert in existing_alerts.xpath("alert"):
                alert_id = alert.get("id")
                alert_ids.append(alert_id)

            # If no "Done" alert exists, create a new alert
            if not alert_ids:
                alert_url = "http://192.168.0.160:4000/api/greenbone/notify-completion-from-api?task_id=$n"
                new_alert = gmp.create_alert(
                    name=f"{task_name} Completion Alert",
                    condition="Done",
                    event="Task run status changed to Done",
                    method="HTTP_GET",
                    url=alert_url
                )
                new_alert_id = new_alert.get("id")
                alert_ids.append(new_alert_id)
                print(f"New alert created with ID: {new_alert_id}")

            # Create the scan task associated with the schedule and target, and include the alert IDs
            task = gmp.create_task(
                name=task_name,
                config_id=config_id,
                target_id=target_id,
                schedule_id=schedule_id,
                scanner_id=scanner_id,
                alert_ids=alert_ids  # Attach all relevant alert IDs to the task
            )
            task_id = task.get('id')

            print(f"Recurring scan task created with ID: {task_id}, scheduled every {recurrence_days} days.")
            return "Recurring scan task created successfully."

    except Exception as e:
        error_message = f"An error occurred: {e}"
        print(error_message)
        return error_message

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python3 postRecurringTask.py <task_name> <target_ip> <start_date> <recurrence_days>")
        sys.exit(1)

    task_name = sys.argv[1]
    target_ip = sys.argv[2]
    start_date = sys.argv[3]  # Expected in format "YYYY-MM-DDTHH:MM:SS" or "YYYY-MM-DDTHH:MM:SSZ"
    recurrence_days = int(sys.argv[4])

    result = create_recurring_schedule(task_name, target_ip, start_date, recurrence_days)
    print(result)
