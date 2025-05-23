import { IDType, IDTypeLike, IPersistedIDType } from './IDType';
import { SelectionUtils } from './SelectionUtils';
import { appContext } from '../base/AppContext';
import { globalEventHandler } from '../base/event';
import { pluginRegistry } from '../plugin/PluginRegistry';
import { IPluginDesc } from '../plugin/interfaces';

export class IDTypeManager {
  public static EXTENSION_POINT_IDTYPE = 'idType';

  public static EVENT_REGISTER_IDTYPE = 'register.idtype';

  private cache = new Map<string, IDType>();

  private filledUp = false;

  private fillUpData = (entries: IDType[]) => {
    entries.forEach((row) => {
      let entry = this.cache.get(row.id);
      let newOne = false;
      if (entry) {
        if (entry instanceof IDType) {
          // @ts-ignore
          entry.name = row.name;
          // @ts-ignore
          entry.names = row.names;
        }
      } else {
        entry = new IDType(row.id, row.name, row.names);
        newOne = true;
      }
      this.cache.set(row.id, entry);
      if (newOne) {
        globalEventHandler.fire(IDTypeManager.EVENT_REGISTER_IDTYPE, entry);
      }
    });
  };

  private toPlural = (name: string) => {
    if (name[name.length - 1] === 'y') {
      return `${name.slice(0, name.length - 1)}ies`;
    }
    return `${name}s`;
  };

  public resolveIdType = (id: IDTypeLike): IDType => {
    if (id instanceof IDType) {
      return id;
    }
    const sid = <string>id;
    return <IDType>this.registerIdType(sid, new IDType(sid, sid, this.toPlural(sid)));
  };

  /**
   * list currently resolved idtypes
   * @returns {Array<IDType>}
   */
  public listIdTypes = (): IDType[] => {
    return Array.from(this.cache.values());
  };

  /**
   * Get a list of all IDTypes available on both the server and the client.
   * @returns {any}
   */
  public listAllIdTypes = async (): Promise<IDType[]> => {
    if (this.filledUp) {
      return Promise.resolve(this.listIdTypes());
    }
    const c = await (<Promise<IDType[]>>appContext.getAPIJSON('/idtype/', {}, []));
    this.filledUp = true;
    this.fillUpData(c);
    return this.listIdTypes();
  };

  public registerIdType = (id: string, idtype: IDType): IDType => {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    this.cache.set(id, idtype);
    globalEventHandler.fire(IDTypeManager.EVENT_REGISTER_IDTYPE, idtype);
    return idtype;
  };

  public persistIdTypes = () => {
    return Array.from(this.cache.entries()).reduce((acc, [id, idType]) => ({ ...acc, [id]: idType.persist() }), {});
  };

  public restoreIdType = (persisted: { [key: string]: IPersistedIDType }) => {
    Object.keys(persisted).forEach((id) => {
      this.resolveIdType(id).restore(persisted[id]!);
    });
  };

  public clearSelection = (type = SelectionUtils.defaultSelectionType) => {
    this.cache.forEach((v) => v.clear(type));
  };

  /**
   * whether the given idtype is an internal one or not, i.e. the internal flag is set or it starts with an underscore
   * @param idtype
   * @return {boolean}
   */
  public isInternalIDType = (idtype: IDType) => {
    return idtype.internal || idtype.id.startsWith('_');
  };

  /**
   * search for all matching ids for a given pattern
   * @param pattern
   * @param limit maximal number of results
   * @return {Promise<void>}
   */
  public searchMapping = (idType: IDType, pattern: string, toIDType: string | IDType, limit = 10): Promise<{ match: string; to: string }[]> => {
    const target = this.resolveIdType(toIDType);
    return appContext.getAPIJSON(`/idtype/${idType.id}/${target.id}/search/`, { q: pattern, limit });
  };

  /**
   * returns the list of idtypes that this type can be mapped to
   * @returns {Promise<IDType[]>}
   */
  public getCanBeMappedTo = (idType: IDType) => {
    if (idType.canBeMappedTo === null) {
      idType.canBeMappedTo = appContext.getAPIJSON(`/idtype/${idType.id}/`).then((list) => list.map(this.resolveIdType));
    }
    return idType.canBeMappedTo;
  };

  public mapOneNameToFirstName = async (idType: IDType, name: string, toIDtype: IDTypeLike): Promise<string> => {
    return this.mapNameToFirstName(idType, [name], toIDtype).then((names) => names[0]!);
  };

  public mapOneNameToName = async (idType: IDType, name: string, toIDtype: IDTypeLike): Promise<string[]> => {
    return this.mapNameToName(idType, [name], toIDtype).then((names) => names[0]!);
  };

  public mapNameToFirstName = async (idType: IDType, names: string[], toIDtype: IDTypeLike): Promise<string[]> => {
    const target = this.resolveIdType(toIDtype);
    if (idType.id === target.id) {
      return names;
    }
    return IDType.chooseRequestMethod(`/idtype/${idType.id}/${target.id}/`, { q: names, mode: 'first' });
  };

  public mapNameToName = async (idType: IDType, names: string[], toIDtype: IDTypeLike): Promise<string[][]> => {
    const target = this.resolveIdType(toIDtype);
    // TODO: Check if this makes sense, what if we have synonyms?
    // if(idType.id === target.id) {
    //   return names.map((name) => [name]);
    // }
    return IDType.chooseRequestMethod(`/idtype/${idType.id}/${target.id}/`, { q: names });
  };

  public findMappablePlugins = (target: IDType, all: IPluginDesc[]) => {
    if (!target) {
      return [];
    }
    const idTypes = Array.from(new Set<string>(all.map((d) => d.idtype)));

    function canBeMappedTo(idtype: string) {
      if (idtype === target.id) {
        return true;
      }
      // lookup the targets and check if our target is part of it
      // @ts-ignore
      return this.getCanBeMappedTo(this.resolveIdType(idtype)).then((mappables: IDType[]) => mappables.some((d) => d.id === target.id));
    }
    // check which idTypes can be mapped to the target one
    return Promise.all(idTypes.map(canBeMappedTo)).then((mappable: boolean[]) => {
      const valid = idTypes.filter((d, i) => mappable[i]);
      return all.filter((d) => valid.indexOf(d.idtype) >= 0);
    });
  };

  init = () => {
    // register known idtypes via registry
    pluginRegistry.listPlugins(IDTypeManager.EXTENSION_POINT_IDTYPE).forEach((plugin) => {
      const { id } = plugin;
      const { name } = plugin;
      const names = plugin.names || this.toPlural(name);
      const internal = Boolean(plugin.internal);
      this.registerIdType(id, new IDType(id, name, names, internal));
    });
  };

  /**
   * @deprecated Use `idTypeManager` instead.
   */
  public static getInstance(): IDTypeManager {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return idTypeManager;
  }
}

export const idTypeManager = new IDTypeManager();
idTypeManager.init();
