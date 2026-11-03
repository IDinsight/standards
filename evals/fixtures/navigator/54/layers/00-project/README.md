# svc-config

Loads the service configuration from a JSON file and fills in defaults.

```sh
node src/cli.js config.json   # print the effective configuration
npm test                      # run the tests
```

See `config.example.json` for the supported keys: `host`, `port`, and
`logLevel` (`debug`, `info`, `warn`, or `error`).
