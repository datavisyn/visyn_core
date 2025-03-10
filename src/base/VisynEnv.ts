export class VisynEnv {
  public static NODE_ENV = process.env.NODE_ENV;

  public static __APP_NAME__ = process.env.__APP_NAME__;

  public static __APP_DISPLAY_NAME__ = process.env.__APP_DISPLAY_NAME__;

  public static __VERSION__ = process.env.__VERSION__;

  public static __LICENSE__ = process.env.__LICENSE__;

  public static __BUILD_ID__ = process.env.__BUILD_ID__;

  public static __APP_CONTEXT__ = process.env.__APP_CONTEXT__;

  public static __DEBUG__ = process.env.__DEBUG__;
}

/**
 * @deprecated Use `VisynEnv` instead.
 */
export class WebpackEnv extends VisynEnv {}
