"""Read only the configured login origin; never print the service descriptor."""
import json
import re
import sys


def service_origin(descriptor):
    containers = descriptor['spec']['template']['spec']['containers']
    # LECTRA is the single-container service provisioned in Episode 5.
    if len(containers) != 1:
        raise ValueError('Unexpected service containers.')
    origins = [entry for entry in containers[0].get('env', [])
               if entry.get('name') == 'APP_ORIGIN']
    if len(origins) != 1 or 'valueFrom' in origins[0] or not isinstance(origins[0].get('value'), str):
        raise ValueError('Expected one unambiguous literal-only APP_ORIGIN.')
    origin = origins[0]['value']
    match = re.fullmatch(r'https://([a-z0-9.-]+)', origin)
    if not match:
        raise ValueError('Expected an HTTPS origin without credentials, port, path or query.')
    host = match.group(1)
    labels = host.split('.')
    if len(host) > 253 or not host.endswith('.run.app') or any(
            not re.fullmatch(r'[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?', label) for label in labels):
        raise ValueError('Expected valid DNS labels for the LECTRA service hostname.')
    return origin


if __name__ == '__main__':
    try:
        print(service_origin(json.load(sys.stdin)))
    except (ValueError, KeyError, TypeError, IndexError, AttributeError):
        sys.exit('Cannot determine a safe configured APP_ORIGIN; service details not printed.')
