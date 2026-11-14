#!/bin/sh
set -eu
# Migration and demo seed are explicit operator commands, never startup side effects.
# exec keeps the Node server as PID 1 so shutdown signals reach its pool cleanup.
exec "$@"
