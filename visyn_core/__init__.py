from fastapi import FastAPI

from .plugin.model import AVisynPlugin, RegHelper


class VisynPlugin(AVisynPlugin):
    def init_app(self, app: FastAPI):
        import logging

        _log = logging.getLogger(__name__)
        try:
            from .rdkit import img_api

            app.include_router(img_api.app)
        except ImportError:
            _log.warn(
                "RDKit is not installed, corresponding API could not be loaded. Consider installing visyn_core[full] or visyn_core[rdkit]."
            )

        from .settings.router import create as create_settings_router

        app.include_router(create_settings_router())

        from .sentry.sentry_proxy_router import sentry_router

        app.include_router(sentry_router)

    def register(self, registry: RegHelper):
        # phovea_server
        registry.append_router("caleydo-idtype", "visyn_core.id_mapping.idtype_api", {})

        # General routers
        registry.append_router("visyn_plugin_router", "visyn_core.plugin.router", {})
        registry.append_router("visyn_xlsx_router", "visyn_core.xlsx", {})

        # DB migration plugins
        registry.append(
            "command",
            "db-migration",
            "visyn_core.dbmigration.manager",
            {"factory": "create_migration_command"},
        )

        # Security plugins
        registry.append(
            "user_stores",
            "dummy_store",
            "visyn_core.security.store.dummy_store",
            {},
        )
        registry.append(
            "user_stores",
            "alb_security_store",
            "visyn_core.security.store.alb_security_store",
            {},
        )
        registry.append(
            "user_stores",
            "no_security_store",
            "visyn_core.security.store.no_security_store",
            {},
        )
        registry.append(
            "user_stores",
            "oauth2_security_store",
            "visyn_core.security.store.oauth2_security_store",
            {},
        )
