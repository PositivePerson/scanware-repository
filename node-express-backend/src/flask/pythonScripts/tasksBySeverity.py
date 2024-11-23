from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform
import json

def get_aggregates():
    path = '/run/gvmd/gvmd.sock'  # Your socket path
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'  # Replace with actual credentials
    password = 'admin'  # Replace with actual credentials

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            gmp.authenticate(username, password)

            # Use get_aggregates to fetch scans grouped by the last_report_created date
            aggregates_response = gmp.get_aggregates(
                resource_type=gmp.types.EntityType.NVT,  # Corrected: Added 'resource_type'
                group_column="family",
                data_column="severity",
                sort_field="last_report_created",
                sort_order="ascending",
                sort_stat="count"
            )

            # Parse the XML response and extract all data
            scan_data = []
            for group in aggregates_response.xpath('aggregate/group'):
                # Extract all relevant fields
                date_value = group.findtext('value', default="N/A")
                count = int(group.findtext('count', default="0"))
                cumulative_count = int(group.findtext('c_count', default="0"))
                
                # Extract statistics
                stats = {}
                for stat in group.xpath('stats'):
                    column_name = stat.get('column', 'unknown')
                    stats[column_name] = {
                        'min': stat.findtext('min', default="0"),
                        'max': stat.findtext('max', default="0"),
                        'mean': stat.findtext('mean', default="0"),
                        'sum': stat.findtext('sum', default="0"),
                        'c_sum': stat.findtext('c_sum', default="0")
                    }

                # Subgroup information if available
                subgroups = []
                for subgroup in group.xpath('subgroup'):
                    subgroup_value = subgroup.findtext('value', default="N/A")
                    subgroup_count = int(subgroup.findtext('count', default="0"))
                    cumulative_subgroup_count = int(subgroup.findtext('c_count', default="0"))
                    subgroup_stats = {}
                    
                    for stat in subgroup.xpath('stats'):
                        column_name = stat.get('column', 'unknown')
                        subgroup_stats[column_name] = {
                            'min': stat.findtext('min', default="0"),
                            'max': stat.findtext('max', default="0"),
                            'mean': stat.findtext('mean', default="0"),
                            'sum': stat.findtext('sum', default="0"),
                            'c_sum': stat.findtext('c_sum', default="0")
                        }

                    subgroups.append({
                        'value': subgroup_value,
                        'count': subgroup_count,
                        'cumulative_count': cumulative_subgroup_count,
                        'stats': subgroup_stats
                    })

                # Append all information
                scan_data.append({
                    'value': date_value,
                    'count': count,
                    'cumulative_count': cumulative_count,
                    'stats': stats,
                    'subgroups': subgroups
                })

            return json.dumps(scan_data, indent=2)

    except Exception as e:
        error_message = f"An error occurred: {e}"
        print(error_message)
        return json.dumps({"error": error_message})

if __name__ == "__main__":
    result = get_aggregates()
    print(result)
