import contextlib
from typing import Any, Literal

from pydantic import AnyHttpUrl, BaseConfig, BaseModel, BaseSettings, Extra, Field
from pydantic.env_settings import EnvSettingsSource, SettingsSourceCallable

from .constants import default_logging_dict


class DBMigrationSettings(BaseModel):
    autoUpgrade: bool = True  # NOQA


class DisableSettings(BaseModel):
    plugins: list[str] = []
    extensions: list[str] = []


class DummyStoreSettings(BaseModel):
    enable: bool = False
    users: list[dict[str, Any]] = [
        {
            "name": "admin",
            "salt": "dcf46ce914154a44b1557eba91c1f50d",
            "password": "e464485eeeca97927191bd77e38137cc5870c53efb05c8ec027faa8d47f0c0ee23e733ea5e494cb045ca46b0f3b6f695b7261a34f46ba3797cde67724d78522a",
            "roles": ["admin"],
        },
        {
            "name": "bob",
            "salt": "35c63c3121b04aaba8c735ee302e9f9d",
            "password": "8cb741b1e6b8cd5eb41767146876de16c736bf0a1af9505a9c44fc662d21ca48a4c9e922cc4454e3034906a27918adc20265063cc3e279b31c59afd74f6e8233",
            "roles": ["bob"],
        },
        {
            "name": "alice",
            "salt": "b955b2adba0c4b599338af5e087931a9",
            "password": "15ee8aa9740221def6fa31c1aa775b170e11e35409edcc86faf7bc437c006be0b4ff372ad42675e8a9c5889d2f99b5b9b5fce8af57740cfaa42519bf74ba2f44",
            "roles": ["alice"],
        },
    ]


class AlbSecurityStoreSettings(BaseModel):
    enable: bool = False
    cookie_name: str | None = None
    signout_url: str | None = None
    email_token_field: str | list[str] = ["email"]
    """
    Field in the JWT token that contains the email address of the user.
    """
    properties_fields: list[str] = []
    """
    Fields in the JWT token payload that should be mapped to the properties of the user.
    """
    audience: str | list[str] | None = None
    """
    Audience of the JWT token.
    """
    issuer: str | None = None
    """
    Issuer of the JWT token.
    """
    decode_options: dict[str, Any] | None = None
    """
    `options` of the `jwt.decode` function. See https://pyjwt.readthedocs.io/en/stable/api.html#jwt.decode for details.
    By default, `verify_signature` is also true, and verifies the signature of the JWT token. Thus, the public key of the ALB is fetched from the AWS API.
    """
    region: str = "eu-central-1"
    """
    The region of the ALB to fetch the public key from.
    """
    decode_algorithms: list[str] = ["ES256"]
    """
    The algorithm used to sign the JWT token. See https://pyjwt.readthedocs.io/en/stable/algorithms.html for details.
    """


class OAuth2SecurityStoreHeader(BaseModel):
    name: str
    """
    Name of the header to extract the JWT token from.
    """
    email_fields: list[str] = []
    """
    Field in the JWT token that contains the email address of the user.
    """
    roles_fields: list[str] = []
    """
    Field in the JWT token that contains the roles of the user.
    """
    properties_fields: list[str] = []
    """
    Fields in the JWT token payload that should be mapped to the properties of the user.
    """


class OAuth2SecurityStoreSettings(BaseModel):
    enable: bool = False
    cookie_name: str | list[str] | None = None
    signout_url: str | None = None
    use_user_headers: bool = False
    """
    If true, the X-Forwarded-Email and X-Forwarded-Groups headers are used to extract the email and roles of the user instead of the JWT token.
    """
    user_email_header: str = "X-Forwarded-Email"
    """
    If `use_user_headers` is true, this header is used to extract the email of the user.
    """
    user_groups_header: str = "X-Forwarded-Groups"
    """
    If `use_user_headers` is true, this header is used to extract the roles of the user.
    """
    token_headers: list[OAuth2SecurityStoreHeader] = []
    """
    Headers from which the JWT token is extracted. The headers are extracted from the request and passed to the `jwt.decode` function.
    The headers are tried in the order they are defined, and the first one that is found is used.
    """
    access_token_header_name: str | None = "X-Forwarded-Access-Token"
    """
    @deprecated: Use `token_headers` instead. This will be made read-only in the future.
    """
    email_token_field: str | list[str] | None = ["email"]
    """
    Field in the JWT token that contains the email address of the user.
    @deprecated: Use `token_headers` instead. This will be made read-only in the future.
    """
    roles_token_field: str | list[str] | None = ["groups"]
    """
    Field in the JWT token that contains the roles of the user.
    @deprecated: Use `token_headers` instead. This will be made read-only in the future.
    """
    properties_fields: list[str] | None = []
    """
    Fields in the JWT token payload that should be mapped to the properties of the user.
    @deprecated: Use `token_headers` instead. This will be made read-only in the future.
    """


class NoSecurityStoreSettings(BaseModel):
    enable: bool = False
    user: str = "admin"
    roles: list[str] = []
    properties: dict[str, Any] = {}


class SecurityStoreSettings(BaseModel):
    dummy_store: DummyStoreSettings = DummyStoreSettings()
    """Settings for the dummy security store"""
    alb_security_store: AlbSecurityStoreSettings = AlbSecurityStoreSettings()
    """Settings for the ALB security store"""
    oauth2_security_store: OAuth2SecurityStoreSettings = OAuth2SecurityStoreSettings()
    """Settings for the oauth2 security store"""
    no_security_store: NoSecurityStoreSettings = NoSecurityStoreSettings()
    """Settings for the no security store"""


class SecuritySettings(BaseModel):
    store: SecurityStoreSettings = SecurityStoreSettings()
    """
    Settings for the security store.
    """
    paths_without_authentication: list[str] = []
    """
    Paths that are not protected by the security store.
    """


class BaseTelemetrySettings(BaseModel):
    enabled: bool = True


class BaseExporterTelemetrySettings(BaseModel):
    endpoint: AnyHttpUrl  # could be "http://localhost:4318"
    headers: dict[str, str] | None = None
    timeout: int | None = None
    kwargs: dict[str, Any] = {}


class MetricsExporterTelemetrySettings(BaseExporterTelemetrySettings):
    pass


class MetricsTelemetrySettings(BaseTelemetrySettings):
    exporter: MetricsExporterTelemetrySettings | None = None


class TracesExporterTelemetrySettings(BaseExporterTelemetrySettings):
    pass


class TracesTelemetrySettings(BaseTelemetrySettings):
    exporter: TracesExporterTelemetrySettings | None = None


class LogsExporterTelemetrySettings(BaseExporterTelemetrySettings):
    pass


class LogsTelemetrySettings(BaseTelemetrySettings):
    exporter: LogsExporterTelemetrySettings | None = None


class TelemetrySettings(BaseModel):
    enabled: bool = False
    """
    Globally enable or disable telemetry.
    """
    service_name: str
    """
    Service name must be a unique, fully qualified name (e.g., myapp.app.datavisyn.io)
    """
    global_exporter: BaseExporterTelemetrySettings | None = None
    """
    Global exporter to be used if metrics.exporter, traces.exporter or logs.exporter are not set.
    """
    metrics: MetricsTelemetrySettings = MetricsTelemetrySettings()
    traces: TracesTelemetrySettings = TracesTelemetrySettings()
    logs: LogsTelemetrySettings = LogsTelemetrySettings()
    metrics_middleware: BaseTelemetrySettings = BaseTelemetrySettings()


class SentrySettings(BaseModel):
    dsn: str | None = None
    """
    Public DSN of the Sentry project.
    """
    frontend_dsn: str | None = None
    """
    Public DSN of the Sentry frontend project.
    """
    backend_dsn: str | None = None
    """
    Public DSN of the Sentry backend project.
    """
    backend_init_options: dict[str, Any] = {}
    """
    Options to be passed to the Sentry SDK during initialization.
    """
    proxy_to: str | None = None
    """
    Proxy Sentry envelopes to this URL. Used if an internal Sentry server is used, otherwise the original DSN is used.
    """
    frontend_proxy_to: str | None = None
    """
    Proxy Sentry frontend envelopes to this URL. Used if an internal Sentry server is used, otherwise the original DSN is used.
    """
    frontend_proxy_verify: bool = True
    """
    Verify the SSL certificate of the frontend proxy.
    """
    frontend_proxy_timeout: int = 30
    """
    Timeout in seconds for the frontend proxy.
    """
    backend_proxy_to: str | None = None
    """
    Proxy Sentry backend envelopes to this URL. Used if an internal Sentry server is used, otherwise the original DSN is used.
    """

    def get_frontend_dsn(self) -> str | None:
        return self.frontend_dsn or self.dsn

    def get_backend_dsn(self) -> str | None:
        return self.backend_dsn or self.dsn

    def get_frontend_proxy_to(self) -> str | None:
        return self.frontend_proxy_to or self.proxy_to

    def get_backend_proxy_to(self) -> str | None:
        return self.backend_proxy_to or self.proxy_to


class VisynCoreSettings(BaseModel):
    main_app: str | None = None
    """
    The main application starting the server, i.e. "visyn_core". Used to infer the app name and version from the plugin for telemetry/Sentry/...
    """
    total_anyio_tokens: int = 100
    """
    The total number of threads to use for anyio. FastAPI uses these threads to run sync routes concurrently.
    """
    telemetry: TelemetrySettings | None = None
    """
    Settings for telemetry using OpenTelemetry, prometheus, ...
    """
    sentry: SentrySettings = SentrySettings()
    """
    Settings for Sentry. DSN will be shared via the client config.
    """
    celery: dict[str, Any] | None = None
    """
    Settings for celery. If not set, celery will not be initialized.
    """
    cypress: bool = False
    """
    @deprecated: Use `e2e` instead.
    """
    e2e: bool = False
    """
    True if the application is running in E2E testing environment. Enables application to return special responses for example.

    To enable this flag in applications, simply add `VISYN_CORE__E2E=true` to your `.env` file.

    Example usage in a route:
    ```
    from visyn_core import manager
    ...
    if manager.settings.visyn_core.e2e:
        # Do something
    ```
    """

    disable: DisableSettings = DisableSettings()
    enabled_plugins: list[str] = []

    # TODO: Proper typing. This is 1:1 passed to the logging.config.dictConfig(...).
    logging: dict = Field(default_logging_dict)

    log_level: str | None = None
    """
    Set the log level here to `DEBUG`, `INFO`, etc. if you only want to override the logging level.
    Otherwise you must override the whole logging config of the root logger in `visyn_core.logging.root.level`.
    """

    # visyn_core
    migrations: DBMigrationSettings = DBMigrationSettings()

    users: list[dict[str, Any]] = Field([])
    """Deprecated: use visyn_core.security.store.dummy_store.users instead."""
    alwaysAppendDummyStore: bool = False  # NOQA
    """Deprecated: use visyn_core.security.store.dummy_store.enable instead."""
    security: SecuritySettings = SecuritySettings()

    client_config: dict[str, Any] | None = None
    """Client config to be loaded via /api/v1/visyn/clientConfig"""


class GlobalSettings(BaseSettings):
    env: Literal["development", "production"] = "production"
    ci: bool = False
    """
    Set to true in CI environments like Github Actions.
    """
    secret_key: str = "VERY_SECRET_STUFF_T0IB84wlQrdMH8RVT28w"

    # JWT options mostly inspired by flask-jwt-extended: https://flask-jwt-extended.readthedocs.io/en/stable/options/#general-options
    jwt_token_location: list[str] = ["headers", "cookies"]
    jwt_expire_in_seconds: int = 24 * 60 * 60
    jwt_refresh_if_expiring_in_seconds: int = 30 * 60
    jwt_algorithm: str = "HS256"
    jwt_access_cookie_name: str = "dv_access_token"
    jwt_header_name: str = "Authorization"
    jwt_header_type: str = "Bearer"
    jwt_cookie_secure: bool = False
    jwt_cookie_samesite: Literal["lax", "strict", "none"] | None = "strict"
    jwt_access_cookie_path: str = "/"

    visyn_core: VisynCoreSettings = VisynCoreSettings()  # type: ignore

    @property
    def is_development_mode(self) -> bool:
        return self.env.startswith("dev")

    @property
    def is_e2e_testing(self) -> bool:
        return self.visyn_core.cypress or self.visyn_core.e2e

    def get_nested(self, key: str, default: Any = None) -> Any | None:
        """
        Retrieves the value at the position of the key from the dict-ified settings, or `default` if `None` is found.
        This method is for legacy purposes only, you should in most cases just use the settings directly.
        """
        keys = key.split(".")
        plugin_id = keys[0]
        dic = self.dict(include={plugin_id})
        for key in keys:
            dic = dic.get(key, None) if dic else None
        return dic if dic is not None else default

    class Config(BaseConfig):
        extra = Extra.allow
        env_nested_delimiter = "__"

        @classmethod
        def customise_sources(
            cls,
            init_settings: SettingsSourceCallable,
            env_settings: EnvSettingsSource,
            file_secret_settings: SettingsSourceCallable,
        ) -> tuple[SettingsSourceCallable, ...]:
            class EnvSettingsSourceWithJSON(EnvSettingsSource):
                def __init__(self, *args, **kwargs):
                    super().__init__(*args, **kwargs)
                    """
                    String vars that end with this suffix are not converted to JSON.
                    """
                    self.as_string_suffix = "_as_string"

                def explode_env_vars(self, *args, **kwargs) -> dict[str, Any]:
                    """
                    This may be hacky, but it allows us to load JSON strings from the environment variables, even for deeply nested models.
                    The original explode_env_vars simply stores the values as strings, and does not load them as JSON.
                    Here, we patch it and iterate over all values, and try to load them as JSON.
                    TODO: This may have one negative side effect: what if my value is typed as a string, but we now convert it to a dict?
                    You can suffix the variable with `_as_string` to prevent this.
                    """
                    exploded = super().explode_env_vars(*args, **kwargs)

                    def str_to_dict(d: dict[str, Any]):
                        for k in list(d.keys()):
                            if isinstance(d[k], dict):
                                str_to_dict(d[k])
                            elif isinstance(d[k], str):
                                if k.lower().endswith(self.as_string_suffix):
                                    # If the value ends with the suffix, add the string value without the suffix to the dict.
                                    d[k.lower().removesuffix(self.as_string_suffix)] = d[k]
                                else:
                                    # Otherwise, try to load the value as JSON.
                                    with contextlib.suppress(ValueError):
                                        d[k] = cls.json_loads(d[k])
                        return d

                    return str_to_dict(exploded)

            return (
                init_settings,
                # Instead of the default EnvSettingsSource, use our custom one.
                EnvSettingsSourceWithJSON(**{s: getattr(env_settings, s) for s in env_settings.__slots__}),
                file_secret_settings,
            )
