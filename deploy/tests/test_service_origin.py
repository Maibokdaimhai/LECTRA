"""Literal-only APP_ORIGIN and DNS-label boundaries; no network operations."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('service_origin', Path(__file__).resolve().parents[1] / 'service_origin.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def descriptor(entries):
    return {'spec': {'template': {'spec': {'containers': [{'env': entries}]}}}}


class ServiceOriginTests(unittest.TestCase):
    def test_supported_literal_origins_are_preserved_exactly(self):
        for url in ['https://lectra-123456789012.asia-southeast1.run.app',
                    'https://lectra-fvnnovx37a-as.a.run.app', 'https://' + 'a' * 63 + '.run.app']:
            with self.subTest(url=url):
                self.assertEqual(module.service_origin(descriptor([{'name': 'APP_ORIGIN', 'value': url}])), url)

    def test_invalid_dns_labels_and_non_origin_urls_are_rejected(self):
        for host in ['lectra..example.run.app', '.lectra.run.app', '-lectra.run.app',
                     'lectra-.run.app', 'lectra_.run.app', 'a' * 64 + '.run.app',
                     '.'.join(['a' * 63] * 4) + '.run.app']:
            with self.subTest(host=host), self.assertRaises(ValueError):
                module.service_origin(descriptor([{'name': 'APP_ORIGIN', 'value': 'https://' + host}]))
        for url in ['http://lectra.run.app', 'https://lectra.run.app/', 'https://lectra.run.app:443',
                    'https://user@lectra.run.app', 'https://lectra.run.app?x=1',
                    'https://lectra.run.app\nINJECT=value', 'https://lectra.run.app.evil.test']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                module.service_origin(descriptor([{'name': 'APP_ORIGIN', 'value': url}]))

    def test_unambiguous_literal_only_entry_required(self):
        for entry in [{'name': 'APP_ORIGIN', 'valueFrom': {'secretKeyRef': {'name': 'not-used'}}},
                      {'name': 'APP_ORIGIN', 'value': 'https://lectra.run.app', 'valueFrom': {}},
                      {'name': 'APP_ORIGIN', 'value': 'https://lectra.run.app', 'valueFrom': None},
                      {'name': 'APP_ORIGIN', 'value': None}]:
            with self.subTest(entry=entry), self.assertRaises(ValueError):
                module.service_origin(descriptor([entry]))
        for entries in [[], [{'name': 'APP_ORIGIN', 'value': 'https://one.run.app'}] * 2]:
            with self.subTest(entries=entries), self.assertRaises(ValueError):
                module.service_origin(descriptor(entries))


if __name__ == '__main__':
    unittest.main()
