# Chaos Drills (Safe by default)

- Dry-run by default. Use `--yes` to execute actions.
- Polls Alertmanager API for expected alerts after each action.

Examples:

```
ops/chaos/drill.sh --restart-api
ops/chaos/drill.sh --pause-db 30
ops/chaos/drill.sh --simulate-disk

# Execute for real
ops/chaos/drill.sh --yes --restart-api
```

Safeguards:
- Requires `--yes` to run disruptive docker commands.
- Disk simulation writes a bounded temp file and removes it.

