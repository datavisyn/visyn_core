from fastapi import FastAPI

from .plugin.model import AVisynPlugin, RegHelper


class VisynPlugin(AVisynPlugin):
    def init_app(self, app: FastAPI):
        from .mol_img import img_api

        app.include_router(img_api.app)

    def register(self, registry: RegHelper):
        import logging

        _log = logging.getLogger(__name__)

        # phovea_server
        registry.append(
            "namespace",
            "caleydo-idtype",
            "visyn_core.id_mapping.idtype_api",
            {"namespace": "/api/idtype", "factory": "create_idtype"},
        )

        try:
            import numpy  # noqa, type: ignore

            registry.append("json-encoder", "numpy", "visyn_core.encoder.json_encoder")
        except ImportError:
            _log.info('numpy not available, skipping "numpy" json encoder')

        registry.append("json-encoder", "set-encoder", "visyn_core.encoder.set_encoder", {})

        registry.append("namespace", "visyn_core_main", "visyn_core.server.mainapp", {"namespace": "/app"})
        registry.append_router("tdp_config_router", "visyn_core.settings.router", {})
        registry.append_router("tdp_plugin_router", "visyn_core.plugin.router", {})
        registry.append("namespace", "tdp_xlsx2json", "visyn_core.xlsx", {"namespace": "/api/tdp/xlsx"})

        # DB migration plugins
        registry.append(
            "command",
            "db-migration",
            "visyn_core.dbmigration.manager",
            {"factory": "create_migration_command"},
        )
        registry.append(
            "namespace",
            "db-migration-api",
            "visyn_core.dbmigration.router",
            {"factory": "create_migration_api", "namespace": "/api/tdp/db-migration"},
        )

        # phovea_security_flask
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

        # tdp_matomo
        registry.append("tdp-config-safe-keys", "matomo", "", {"configKey": "visyn_core.matomo"})

        # phovea_data_mongo
        registry.append("dataset-provider", "dataset-graph", "visyn_core.graph", {})
