from datetime import datetime
import sys
import json
from lxml import etree  # Ensure etree is imported
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def parse_datetime(dt_string):
    if not dt_string or dt_string == "N/A":  # Check for empty or "N/A" strings
        return None
    if dt_string.endswith("Z"):
        dt_string = dt_string.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(dt_string)
    except ValueError:
        return None

def get_all_task_details():
    path = '/run/gvmd/gvmd.sock'  # Your socket path
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'  # Replace with actual credentials
    password = 'admin'  # Replace with actual credentials

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            gmp.authenticate(username, password)

            # Fetch all tasks with detailed information
            # tasks_response = gmp.get_tasks(details=True, ignore_pagination=True, filter_string="rows=62")
            tasks_response = gmp.get_tasks(details=True, filter_string="rows=1000")
            # print(etree.tostring(tasks_response, pretty_print=True))  # Debug: Print XML response
            task_list = []

            for task in tasks_response.xpath('task'):
                task_id = task.get('id')
                task_name = task.findtext('name', default="N/A")
                task_status = task.findtext('status', default="N/A")
                task_progress = task.findtext('progress', default="N/A")
                task_owner = task.findtext('owner/name', default="N/A")
                task_comment = task.findtext('comment', default="")
                creation_time = task.findtext('creation_time', default="N/A")
                modification_time = task.findtext('modification_time', default="N/A")
                writable = task.findtext('writable', default="0")
                in_use = task.findtext('in_use', default="0")
                alterable = task.findtext('alterable', default="0")
                usage_type = task.findtext('usage_type', default="N/A")

                # Permissions and Tags (assuming only names needed)
                permissions = [perm.findtext('name') for perm in task.xpath('permissions/permission')]
                tag_info = [
                    {
                        'id': tag.get('id', ""),
                        'name': tag.findtext('name', default=""),
                        'value': tag.findtext('value', default=""),
                        'comment': tag.findtext('comment', default="")
                    }
                    for tag in task.xpath('user_tags/tag')
                ]

                # Config information
                config_id = task.find('config').get('id', "N/A") if task.find('config') is not None else "N/A"
                config_name = task.findtext('config/name', default="N/A")
                config_trash = task.findtext('config/trash', default="0")

                # Target information
                target_id = task.find('target').get('id', "N/A") if task.find('target') is not None else "N/A"
                target_name = task.findtext('target/name', default="N/A")
                target_ip = task.findtext('target/hosts', default="N/A")
                target_trash = task.findtext('target/trash', default="0")

                # Scanner information
                scanner_id = task.find('scanner').get('id', "N/A") if task.find('scanner') is not None else "N/A"
                scanner_name = task.findtext('scanner/name', default="N/A")
                scanner_type = task.findtext('scanner/type', default="N/A")

                # Alert information
                alert_id = task.find('alert').get('id', "N/A") if task.find('alert') is not None else "N/A"
                alert_name = task.findtext('alert/name', default="N/A")

                # Schedule information
                schedule_id = task.find('schedule').get('id', "N/A") if task.find('schedule') is not None else "N/A"
                schedule_name = task.findtext('schedule/name', default="N/A")
                icalendar = task.findtext('icalendar', default="")
                timezone = task.findtext('timezone', default="N/A")
                schedule_periods = task.findtext('schedule_periods', default="0")

                # Report and scan information
                report_count = task.findtext('report_count', default="0")
                result_count = task.findtext('result_count', default="0")
                finished_reports = task.findtext('report_count/finished', default="0")
                trend = task.findtext('trend', default="N/A")
                timestamp = task.findtext('timestamp', default="N/A")

                 # Current report details if available
                current_report = task.find('current_report/report')
                current_report_id = current_report.get('id', "N/A") if current_report is not None else "N/A"
                scan_start = parse_datetime(current_report.findtext('scan_start', default="")) if current_report is not None else None
                scan_end = parse_datetime(current_report.findtext('scan_end', default="")) if current_report is not None else None

                # Calculate duration if scan_start and scan_end are valid datetime objects
                duration = "N/A"
                if isinstance(scan_start, datetime) and isinstance(scan_end, datetime):
                    duration = str((scan_end - scan_start).total_seconds()) + " seconds"

                # Severity and report statistics
                false_positive = task.findtext('false_positive', default="0")
                log = task.findtext('log', default="0")
                info = task.findtext('info', default="0")
                warning = task.findtext('warning', default="0")
                hole = task.findtext('hole', default="0")
                severity = task.findtext('severity', default="0")

                # Observers (if any)
                observers = [
                    {
                        'group_id': observer.find('group').get('id', "N/A") if observer.find('group') is not None else "N/A",
                        'group_name': observer.findtext('group/name', default="N/A"),
                        'role_id': observer.find('role').get('id', "N/A") if observer.find('role') is not None else "N/A",
                        'role_name': observer.findtext('role/name', default="N/A")
                    }
                    for observer in task.xpath('observers')
                ]

                # Preferences
                preferences = [
                    {
                        'name': pref.findtext('name', default="N/A"),
                        'scanner_name': pref.findtext('scanner_name', default="N/A"),
                        'value': pref.findtext('value', default="N/A")
                    }
                    for pref in task.xpath('preferences/preference')
                ]

                # Append all the gathered information
                task_list.append({
                    'id': task_id,
                    'name': task_name,
                    'status': task_status,
                    'finished': finished_reports,
                    'progress': task_progress,
                    'owner': task_owner,
                    'comment': task_comment,
                    'creation_time': creation_time,
                    'modification_time': modification_time,
                    'writable': writable,
                    'in_use': in_use,
                    'alterable': alterable,
                    'usage_type': usage_type,
                    'permissions': permissions,
                    'user_tags': tag_info,
                    'config': {
                        'id': config_id,
                        'name': config_name,
                        'trash': config_trash,
                    },
                    'target': {
                        'id': target_id,
                        'name': target_name,
                        'hosts': target_ip,
                        'trash': target_trash,
                    },
                    'scanner': {
                        'id': scanner_id,
                        'name': scanner_name,
                        'type': scanner_type,
                    },
                    'alert': {
                        'id': alert_id,
                        'name': alert_name,
                    },
                    'schedule': {
                        'id': schedule_id,
                        'name': schedule_name,
                        'icalendar': icalendar,
                        'timezone': timezone,
                        'periods': schedule_periods,
                    },
                    'report': {
                        'count': report_count,
                        'result_count': result_count,
                        'trend': trend,
                        'last_timestamp': timestamp,
                        'false_positive': false_positive,
                        'log': log,
                        'info': info,
                        'warning': warning,
                        'hole': hole,
                        'severity': severity,
                    },
                    'current_report': {
                        'id': current_report_id,
                        'scan_start': scan_start.isoformat() if isinstance(scan_start, datetime) else scan_start,
                        'scan_end': scan_end.isoformat() if isinstance(scan_end, datetime) else scan_end,
                        'duration': duration,
                    },
                    'observers': observers,
                    'preferences': preferences,
                })

            return json.dumps(task_list, indent=2)


    except Exception as e:
        error_message = f"An error occurred: {e}"
        print(error_message)
        return json.dumps({"error": error_message})

if __name__ == "__main__":
    result = get_all_task_details()
    print(result)
