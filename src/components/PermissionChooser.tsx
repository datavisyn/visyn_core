import * as React from 'react';
import uniqueId from 'lodash/uniqueId';
import { EPermission, Permission, UserUtils, UserSession, userSession } from '../security';
import { i18n } from '../i18n';

function PermissionsEntry({
  permission,
  setPermission,
  setGetter,
}: {
  permission: Permission;
  setPermission: (permission: Permission) => void;
  setGetter: (permission: Permission) => Set<EPermission>;
}) {
  const id = React.useMemo(() => uniqueId('PermissionsEntry'), []);

  return (
    <div className="btn-group col-sm-auto" role="group">
      <input
        type="radio"
        className="btn-check"
        name={`permission_${id}`}
        id={`btnradio_permissions_${id}_none`}
        autoComplete="off"
        checked={!setGetter(permission).has(EPermission.READ)}
        onChange={() => {
          const p = permission.clone();
          setGetter(p).clear();
          setPermission(p);
        }}
      />
      <label htmlFor={`btnradio_permissions_${id}_none`} className="form-label btn btn-outline-secondary btn-sm">
        <i className="fas fa-ban" /> {i18n.t('visyn:permission.noPermission')}
      </label>
      <input
        type="radio"
        className="btn-check"
        name={`permission_${id}`}
        id={`btnradio_permissions_${id}_read`}
        autoComplete="off"
        checked={setGetter(permission).has(EPermission.READ) && !setGetter(permission).has(EPermission.WRITE)}
        onChange={() => {
          const p = permission.clone();
          setGetter(p).clear();
          setGetter(p).add(EPermission.READ);
          setPermission(p);
        }}
      />
      <label htmlFor={`btnradio_permissions_${id}_read`} className="form-label btn btn-outline-secondary btn-sm">
        <i className="fas fa-eye" /> {i18n.t('visyn:permission.read')}
      </label>
      <input
        type="radio"
        className="btn-check"
        name={`permission_${id}`}
        id={`btnradio_permissions_${id}_write`}
        autoComplete="off"
        checked={setGetter(permission).has(EPermission.WRITE)}
        onChange={() => {
          const p = permission.clone();
          setGetter(p).clear();
          setGetter(p).add(EPermission.READ);
          setGetter(p).add(EPermission.WRITE);
          setPermission(p);
        }}
      />
      <label htmlFor={`btnradio_permissions_${id}_write`} className="form-label btn btn-outline-secondary btn-sm">
        <i className="fas fa-edit" /> {i18n.t('visyn:permission.write')}
      </label>
    </div>
  );
}

export function PermissionChooser({
  permission,
  buddies,
  group,
  setPermission,
  setBuddies,
  setGroup,
  extra = null,
}: {
  permission: Permission;
  buddies: string[];
  group: string;
  setPermission: (permission: Permission) => void;
  setBuddies: (buddies: string[]) => void;
  setGroup: (group: string) => void;
  extra?: React.ReactNode;
}) {
  const id = React.useMemo(() => uniqueId('PermissionChooser'), []);
  const user = userSession.currentUser();
  const roles = user ? user.roles : UserUtils.ANONYMOUS_USER.roles;
  const [advancedOpen, setAdvancedOpen] = React.useState<boolean>(false);

  return (
    <>
      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          name="permission_public"
          id={`global_permission_private_${id}`}
          checked={!permission.others.has(EPermission.READ)}
          onChange={() => {
            const p = permission.clone();
            p.others.clear();
            setPermission(p);
          }}
        />
        <label className="form-label form-check-label" htmlFor={`global_permission_private_${id}`}>
          {' '}
          <i className="fas fa-user" /> {i18n.t('visyn:permission.private')}
        </label>
      </div>
      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          name="permission_public"
          id={`global_permission_public_${id}`}
          checked={permission.others.has(EPermission.READ)}
          onChange={() => {
            const p = permission.clone();
            p.others.clear();
            p.others.add(EPermission.READ);
            setPermission(p);
          }}
        />
        <label className="form-label form-check-label" htmlFor={`global_permission_public_${id}`}>
          <i className="fas fa-users" /> {i18n.t('visyn:permission.publicMsg')}
        </label>
      </div>

      <button type="button" name="permission_advanced" className="btn btn-outline-secondary btn-sm float-end" onClick={() => setAdvancedOpen((o) => !o)}>
        {i18n.t('visyn:permission.advanced')}
      </button>
      {extra}
      <div className={advancedOpen ? 'd-block' : 'd-none'}>
        <div className="tdp-permissions-entry row d-flex align-items-center mt-1">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="form-label col-sm-auto ps-2">{i18n.t('visyn:permission.public')}</label>
          <span />
          <PermissionsEntry permission={permission} setPermission={setPermission} setGetter={(p) => p.others} />
        </div>

        <p className="form-text">{i18n.t('visyn:permission.definePermissions')}</p>

        <div className="tdp-permissions-entry row d-flex align-items-center mt-1">
          <label className="form-label col-sm-auto ps-2" htmlFor={`permission_group_name_${id}`}>
            {i18n.t('visyn:permission.group')}
          </label>
          <select
            id={`permission_group_name_${id}`}
            name="permission_group_name"
            className="form-select form-select-sm"
            value={group}
            onChange={(e) => setGroup(e.currentTarget.value)}
          >
            <option value="">None</option>
            {roles.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <PermissionsEntry permission={permission} setPermission={setPermission} setGetter={(p) => p.group} />
        </div>

        <p className="form-text">{i18n.t('visyn:permission.specifyRole')}</p>

        <div className="tdp-permissions-entry row d-flex align-items-center mt-1">
          <label className="form-label col-sm-auto ps-2" htmlFor={`permission_buddies_name_${id}`}>
            {i18n.t('visyn:permission.buddies')}
          </label>
          <input
            id={`permission_buddies_name_${id}`}
            name="permission_buddies_name"
            className="form-control form-control-sm"
            placeholder={i18n.t('visyn:permission.buddiesPlaceholder')}
            value={buddies.join(';')}
            onChange={(e) => setBuddies(e.currentTarget.value.split(';'))}
          />
          <PermissionsEntry permission={permission} setPermission={setPermission} setGetter={(p) => p.buddies} />
        </div>
        <p className="form-text">{i18n.t('visyn:permission.buddiesDescription')}</p>
      </div>
    </>
  );
}
