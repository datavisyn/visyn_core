# Telemetry

`visyn_core` has built in support for sending metrics, logs, and traces to [OTLP](https://opentelemetry.io/docs/specs/otel/protocol/) compatible receivers (like [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)). Then, we can observe the FastAPI application on [Grafana](https://github.com/grafana/grafana). Generally, we are using the following services to collect, consume, and visualize these pillars of observability:

1. Metrics with [Prometheus](https://prometheus.io/)
2. Traces with [Tempo](https://github.com/grafana/tempo)
3. Logs with [Loki](https://github.com/grafana/loki)

## How to use locally

Locally, `visyn_core` includes a `docker compose` file with all required services. Simply run the following command in your `visyn_core` folder (or adjust the path if you want to observe other apps). 

```bash
docker compose -f ./deploy/telemetry/docker-compose.telemetry.yml up
```

This will start all required services, with the most important one being the `otel-collector`. This one is exposing port 4318, which it uses to receive OTLP data over HTTP. This will be the destination to which apps will send their metrics, logs, and traces.

It will also start Grafana on http://localhost:3000, allowing you to directly jump into the corresponding dashboards. All the datasources are already preconfigured.

Now you need to tell your application to start sending metrics to these endpoints, which can be done via the following settings in your backend `.env`: 

```.env
# To enable the telemetry export
VISYN_CORE__TELEMETRY__ENABLED=true
# A unique name describing your application (i.e. the domain or a local name)
VISYN_CORE__TELEMETRY__SERVICE_NAME=my_app.local
# The endpoint to send data to
VISYN_CORE__TELEMETRY__GLOBAL_EXPORTER__ENDPOINT=http://localhost:4318
```

Now, upon starting the server, you should see metrics, logs, and traces appearing in the `FastAPI Observability` dashboard in Grafana.