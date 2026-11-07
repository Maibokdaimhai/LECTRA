if (process.versions.node !== '24.22.1') {
  console.error('LECTRA setup requires Node 24.22.1. Select the pinned runtime before installing.');
  process.exit(1);
}
