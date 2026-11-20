"""Read only the configured login origin; never print the service descriptor."""
import json
import re
import sys


def service_origin(descriptor):
    containers = descriptor['spec']['template']['spec']['containers']
    # LECTRA is the single-container service provisioned in Episode 5.
    if len(containers) != 1:
        raise ValueError('Unexpected service containers.')
    origins = [entry.get('value') for entry in containers[0].get('env', [])
               if entry.get('name') == 'APP_ORIGIN']
    if len(origins) != 1 or not isinstance(origins[0], str) or not re.fullmatch(
            r'https://[a-z0-9][a-z0-9.-]*[.]run[.]app', origins[0]):
        raise ValueError('Expected one literal HTTPS APP_ORIGIN for the LECTRA service.')
    return origins[0]


if __name__ == '__main__':
    try:
        print(service_origin(json.load(sys.stdin)))
    except (ValueError, KeyError, TypeError, IndexError, AttributeError):
        sys.exit('Cannot determine a safe configured APP_ORIGIN; service details not printed.')
