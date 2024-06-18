import pytest
from fastapi.testclient import TestClient
from prometheus_client.parser import text_string_to_metric_families


@pytest.mark.parametrize(
    "workspace_config",
    [
        {
            "visyn_core": {
                "enabled_plugins": ["visyn_core"],
                "telemetry": {
                    "enabled": True,
                    "service_name": "visyn.app.datavisyn.io",
                    "metrics": {"enabled": True, "export_endpoint": None},
                    "metrics_middleware": {"enabled": True},
                    "traces": {"enabled": False, "export_endpoint": None},
                    "logs": {"enabled": False},
                },
            },
        }
    ],
)
def test_fastapi_metrics(client: TestClient):
    # Trigger a request
    client.get("/api/health")

    metrics_text = client.get("/api/metrics").text
    parsed = {m.name: m for m in text_string_to_metric_families(metrics_text)}

    # Check for app info
    fastapi_app_info_metric = parsed["fastapi_app_info"]  # TODO: Why _1?
    assert len(fastapi_app_info_metric.samples) == 1
    assert fastapi_app_info_metric.samples[0].labels["app_name"] == "visyn.app.datavisyn.io"

    # Check for request counts
    fastapi_requests_metric = parsed["fastapi_requests"]  # TODO: Why _1?
    assert len(fastapi_requests_metric.samples) == 2
    assert fastapi_requests_metric.samples[0].labels["path"] == "/api/health"
    assert fastapi_requests_metric.samples[0].value == 1
    assert fastapi_requests_metric.samples[1].labels["path"] == "/api/metrics"
    assert fastapi_requests_metric.samples[1].value == 1

    # Trigger it again
    client.get("/api/health")
    metrics_text = client.get("/api/metrics").text
    parsed = {m.name: m for m in text_string_to_metric_families(metrics_text)}

    # And check for increased counts
    fastapi_requests_metric = parsed["fastapi_requests"]  # TODO: Why _1?
    assert len(fastapi_requests_metric.samples) == 2
    assert fastapi_requests_metric.samples[0].labels["path"] == "/api/health"
    assert fastapi_requests_metric.samples[0].value == 2
    assert fastapi_requests_metric.samples[1].labels["path"] == "/api/metrics"
    assert fastapi_requests_metric.samples[1].value == 2
