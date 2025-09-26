# Ops - Commands

- Enable test alert for 60s then revert:
```
sed -n '/# BEGIN AlwaysFiring/,/# END AlwaysFiring/p' ops/alerts/alert_rules.yml | sed 's/^# \(.*\)$/\1/' > /tmp/always.rules && cat /tmp/always.rules >> ops/alerts/alert_rules.yml && sleep 60 && git checkout -- ops/alerts/alert_rules.yml
```

- Synthetic:
```
ops/synthetic/run-synthetic.sh
```

- Load test:
```
ops/load/run-k6.sh
```

- Chaos drills (dry-run; add --yes to execute):
```
ops/chaos/drill.sh --restart-api
ops/chaos/drill.sh --pause-db 30
ops/chaos/drill.sh --simulate-disk
```

- Headers audit:
```
ops/headers-audit.sh
```

