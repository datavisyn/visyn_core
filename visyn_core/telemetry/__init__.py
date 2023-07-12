import logging

import opentelemetry._logs as _logs
import opentelemetry.metrics as metrics
import opentelemetry.trace as trace
from fastapi import FastAPI, Response
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter, _append_logs_path
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter, _append_metrics_path
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter, _append_trace_path
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.system_metrics import SystemMetricsInstrumentor
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.metrics import MeterProvider  # type: ignore
from opentelemetry.sdk.metrics.export import MetricReader, PeriodicExportingMetricReader  # type: ignore
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from prometheus_client import CONTENT_TYPE_LATEST, REGISTRY, generate_latest

from ..settings.model import TelemetrySettings

_log = logging.getLogger(__name__)


def init_telemetry(app: FastAPI, settings: TelemetrySettings) -> None:
    # The FastAPI instrumentation is adding a middleware which is instantiated more than once, causing warnings for existing instruments
    # See https://github.com/open-telemetry/opentelemetry-python-contrib/issues/1335
    class InstrumentWarningFilter(logging.Filter):
        def filter(self, record: logging.LogRecord) -> bool:
            return "An instrument with name http.server." not in record.getMessage()

    logging.getLogger("opentelemetry.sdk.metrics._internal").addFilter(InstrumentWarningFilter())

    # Create a resource based on the spec: https://github.com/open-telemetry/semantic-conventions/blob/main/specification/resource/semantic_conventions/README.md#service
    resource = Resource.create(attributes={SERVICE_NAME: settings.service_name, "compose_service": settings.service_name})

    global_exporter_settings = settings.global_exporter

    meter_provider: MeterProvider | None = None
    if settings.metrics.enabled:
        _log.info("Enabling OpenTelemetry metrics")

        metric_readers: list[MetricReader] = [PrometheusMetricReader()]

        # Use the global exporter settings if no exporter settings are defined for the metrics
        exporter_settings = settings.metrics.exporter or global_exporter_settings

        if exporter_settings:
            metric_readers.append(
                PeriodicExportingMetricReader(
                    exporter=OTLPMetricExporter(
                        # If we are using the global exporter settings, append the metrics path
                        endpoint=_append_metrics_path(exporter_settings.endpoint)
                        if exporter_settings == global_exporter_settings
                        else exporter_settings.endpoint,
                        headers=exporter_settings.headers,
                        timeout=exporter_settings.timeout,
                        **exporter_settings.kwargs,
                    ),
                    export_interval_millis=5_000,
                    export_timeout_millis=1_000,
                )
            )

        # Create MeterProvider with exporters and set it as the global meter provider
        meter_provider = MeterProvider(
            resource=resource,
            metric_readers=metric_readers,
        )
        metrics.set_meter_provider(meter_provider)

        # Metric instrumentors
        SystemMetricsInstrumentor().instrument(meter_provider=meter_provider)

        @app.on_event("shutdown")
        def shutdown_meter_event():
            _log.info("Shutting down OpenTelemetry meter")
            try:
                meter_provider.shutdown(timeout_millis=1_000)
            except Exception:
                _log.exception("Error shutting down OpenTelemetry meter")

        class CustomMetricsResponse(Response):
            media_type = CONTENT_TYPE_LATEST

        @app.get("/metrics", tags=["Telemetry"], response_class=CustomMetricsResponse)
        def prometheus_metrics():
            """
            Prometheus metrics endpoint. Is not required as we are pushing metrics using OTLPMetricExporter, but can be used for debugging purposes.
            """
            return CustomMetricsResponse(generate_latest(REGISTRY), headers={"Content-Type": CONTENT_TYPE_LATEST})

    tracer_provider: TracerProvider | None = None
    if settings.traces.enabled:
        _log.info("Enabling OpenTelemetry traces")
        # Create TracerProvider and set it as the global tracer provider
        tracer_provider = TracerProvider(resource=resource)
        trace.set_tracer_provider(tracer_provider)

        # Use the global exporter settings if no exporter settings are defined for the metrics
        exporter_settings = settings.traces.exporter or global_exporter_settings

        if exporter_settings:
            # Add the exporter to the tracer
            tracer_provider.add_span_processor(
                BatchSpanProcessor(
                    OTLPSpanExporter(
                        # If we are using the global exporter settings, append the traces path
                        endpoint=_append_trace_path(exporter_settings.endpoint)
                        if exporter_settings == global_exporter_settings
                        else exporter_settings.endpoint,
                        headers=exporter_settings.headers,
                        timeout=exporter_settings.timeout,
                        **exporter_settings.kwargs,
                    )
                )
            )

        # Trace instrumentors
        LoggingInstrumentor().instrument(set_logging_format=True, tracer_provider=tracer_provider)
        SQLAlchemyInstrumentor().instrument(enable_commenter=True, commenter_options={}, tracer_provider=tracer_provider)
        HTTPXClientInstrumentor().instrument(tracer_provider=tracer_provider)

        @app.on_event("shutdown")
        def shutdown_tracer_event():
            _log.info("Shutting down OpenTelemetry tracer")
            try:
                tracer_provider.shutdown()
            except Exception:
                _log.exception("Error shutting down OpenTelemetry tracer")

    if meter_provider or tracer_provider:
        RequestsInstrumentor().instrument(tracer_provider=tracer_provider, meter_provider=meter_provider)
        # Add FastAPI instrumentor which adds trace ids to all requests
        FastAPIInstrumentor.instrument_app(app, meter_provider=meter_provider, tracer_provider=tracer_provider)

    if settings.logs.enabled:
        _log.info("Enabling OpenTelemetry logs")
        # Create TracerProvider and set it as the global tracer provider
        logs_provider = LoggerProvider(resource=resource)
        _logs.set_logger_provider(logs_provider)

        # Use the global exporter settings if no exporter settings are defined for the metrics
        exporter_settings = settings.logs.exporter or global_exporter_settings

        if exporter_settings:
            # Add the exporter to the logs provider
            logs_provider.add_log_record_processor(
                BatchLogRecordProcessor(
                    OTLPLogExporter(
                        # If we are using the global exporter settings, append the logs path
                        endpoint=_append_logs_path(exporter_settings.endpoint)
                        if exporter_settings == global_exporter_settings
                        else exporter_settings.endpoint,
                        headers=exporter_settings.headers,
                        timeout=exporter_settings.timeout,
                        **exporter_settings.kwargs,
                    )
                )
            )

        @app.on_event("shutdown")
        def shutdown_logs_event():
            _log.info("Shutting down OpenTelemetry logs")
            try:
                logs_provider.shutdown()
            except Exception:
                _log.exception("Error shutting down OpenTelemetry logs")

        handler = LoggingHandler()
        # Attach LoggingHandler to root logger
        logger = logging.getLogger()
        logger.addHandler(handler)

    if settings.metrics_middleware.enabled:
        _log.info("Enabling FastAPIMetricsMiddleware")
        # Metrics middleware
        from ..middleware.fastapi_metrics_middleware import FastAPIMetricsMiddleware

        app.add_middleware(FastAPIMetricsMiddleware, service_name=settings.service_name)
