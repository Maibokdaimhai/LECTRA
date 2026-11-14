"""Build the subprocess environment without Compose shell overrides."""

def isolated_environment(inherited, managed_keys):
    # Derive exact managed keys from the env-file values, so adding a new Compose
    # setting cannot silently reintroduce precedence from the calling shell.
    environment = {key: value for key, value in inherited.items()
                   if key not in managed_keys and not key.startswith((
                       'PG', 'COMPOSE_', 'SEED_', 'ALLOW_', 'DATABASE_',
                       'TEST_DATABASE', 'APP_ORIGIN', 'SESSION_SECRET',
                       'NODE_ENV', 'TRUST_PROXY', 'PORT', 'API_IMAGE', 'WEB_IMAGE'))}
    environment['NO_COLOR'] = '1'
    return environment
