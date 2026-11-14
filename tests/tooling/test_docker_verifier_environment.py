import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / 'scripts'))
from docker_verifier_environment import isolated_environment


class VerifierEnvironmentTests(unittest.TestCase):
    def test_managed_compose_values_cannot_override_env_file(self):
        keys = {'POSTGRES_PASSWORD', 'SESSION_SECRET', 'SEED_OWNER_PASSWORD',
                'SEED_RESPONDENT_PASSWORD', 'APP_ORIGIN', 'WEB_PORT',
                'API_PORT', 'API_IMAGE', 'WEB_IMAGE'}
        inherited = {key: 'synthetic-unwanted-shell-value' for key in keys}
        actual = isolated_environment({**inherited, 'PATH': '/synthetic/tools'}, keys)
        self.assertFalse(set(actual) & keys)
        self.assertEqual(actual['PATH'], '/synthetic/tools')

    def test_future_managed_key_is_automatically_isolated(self):
        self.assertNotIn('NEW_COMPOSE_SETTING', isolated_environment({'NEW_COMPOSE_SETTING': 'override'}, {'NEW_COMPOSE_SETTING'}))

    def test_connection_controls_removed_but_docker_runtime_access_preserved(self):
        actual = isolated_environment({'PGHOST': 'unexpected-host', 'COMPOSE_PROJECT_NAME': 'other-project',
                                       'DATABASE_URL': 'synthetic-url', 'DOCKER_HOST': 'unix:///synthetic.sock',
                                       'HOME': '/synthetic/home'}, set())
        self.assertEqual(actual, {'DOCKER_HOST': 'unix:///synthetic.sock', 'HOME': '/synthetic/home', 'NO_COLOR': '1'})

    def test_does_not_mutate_calling_environment(self):
        original = {'WEB_PORT': '1', 'PATH': '/synthetic/tools'}
        isolated_environment(original, {'WEB_PORT'})
        self.assertEqual(original, {'WEB_PORT': '1', 'PATH': '/synthetic/tools'})


if __name__ == '__main__':
    unittest.main()
