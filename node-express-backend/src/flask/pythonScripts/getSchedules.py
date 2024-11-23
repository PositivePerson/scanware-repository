import sys
import json
from datetime import datetime, timedelta
from icalendar import Calendar
from lxml import etree
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def parse_rrule_and_next_run(rrule, dtstart):
    recurrence = "N/A"
    next_run = "N/A"
    try:
        if rrule and 'INTERVAL' in rrule:
            interval_days = int(rrule.split("INTERVAL=")[-1].split(';')[0])
            recurrence = f"Every {interval_days} days"
            dtstart_datetime = datetime.strptime(dtstart, "%Y%m%dT%H%M%SZ")
            next_run_datetime = dtstart_datetime + timedelta(days=interval_days)
            next_run = next_run_datetime.strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        print(f"Error parsing recurrence rule: {e}", file=sys.stderr)
    return recurrence, next_run

def get_all_schedule_details():
    path = '/run/gvmd/gvmd.sock'  # Your socket path
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'
    password = 'admin'

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            gmp.authenticate(username, password)

            # Fetch all schedules with associated tasks
            schedules_response = gmp.get_schedules(tasks=True, filter_string=f"rows=1000")
            schedule_list = []

            for schedule in schedules_response.xpath('.//schedule'):
                schedule_id = schedule.get('id')
                schedule_name = schedule.findtext('name', default="N/A")
                schedule_owner = schedule.findtext('owner/name', default="N/A")
                schedule_in_use = schedule.findtext('in_use', default="0")
                
                # Parse iCalendar data for recurrence, first run, and next run
                icalendar_data = schedule.findtext('icalendar', default="")
                first_run, next_run, recurrence = "N/A", "N/A", "N/A"
                if icalendar_data:
                    try:
                        cal = Calendar.from_ical(icalendar_data)
                        for component in cal.walk():
                            if component.name == "VEVENT":
                                dtstart = component.get('dtstart').dt.strftime("%Y%m%dT%H%M%SZ")
                                rrule = component.get('rrule')
                                first_run = component.get('dtstart').dt.strftime("%Y-%m-%d %H:%M:%S")
                                if rrule:
                                    recurrence, next_run = parse_rrule_and_next_run(rrule.to_ical().decode('utf-8'), dtstart)
                    except Exception as e:
                        print(f"Error parsing iCalendar data: {e}", file=sys.stderr)

                # Default duration if not specified
                duration = "Entire Operation"

                # Add the schedule details to the list
                schedule_list.append({
                    'id': schedule_id,
                    'name': schedule_name,
                    'first_run': first_run,
                    'next_run': next_run,
                    'recurrence': recurrence,
                    'duration': duration,
                    'owner': schedule_owner,
                    'in_use': schedule_in_use
                })

            # Return the list as a JSON string for further processing
            return json.dumps({"status": "success", "schedules": schedule_list}, indent=2)

    except GvmError as e:
        error_message = f"An error occurred: {e}"
        print(error_message, file=sys.stderr)
        return json.dumps({"status": "error", "error": error_message})

if __name__ == "__main__":
    result = get_all_schedule_details()
    print(result)
