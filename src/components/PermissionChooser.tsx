import * as React from 'react';
import uniqueId from 'lodash/uniqueId';
import { DefaultProps } from '@mantine/styles';
import { Box, Button, Collapse, Text, Group, Radio, Stack, TextInput, SegmentedControl, Select } from '@mantine/core';
import { EPermission, Permission, UserUtils, userSession } from '../security';
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
  let value: 'none' | 'read' | 'write' = 'none';

  if (!setGetter(permission).has(EPermission.READ)) {
    value = 'none';
  } else if (setGetter(permission).has(EPermission.READ) && !setGetter(permission).has(EPermission.WRITE)) {
    value = 'read';
  } else if (setGetter(permission).has(EPermission.WRITE)) {
    value = 'write';
  }

  return (
    <SegmentedControl
      value={value}
      onChange={(newValue) => {
        switch (newValue) {
          case 'none': {
            const p = permission.clone();
            setGetter(p).clear();
            setPermission(p);
            break;
          }
          case 'read': {
            const p = permission.clone();
            setGetter(p).clear();
            setGetter(p).add(EPermission.READ);
            setPermission(p);
            break;
          }
          case 'write': {
            const p = permission.clone();
            setGetter(p).clear();
            setGetter(p).add(EPermission.READ);
            setGetter(p).add(EPermission.WRITE);
            setPermission(p);
            break;
          }
          default:
            break;
        }
      }}
      data={[
        {
          label: (
            <>
              <i className="fas fa-ban" /> {i18n.t('visyn:permission.noPermission')}
            </>
          ),
          value: 'none',
        },
        {
          label: (
            <>
              <i className="fas fa-eye" /> {i18n.t('visyn:permission.read')}
            </>
          ),
          value: 'read',
        },
        {
          label: (
            <>
              <i className="fas fa-edit" /> {i18n.t('visyn:permission.write')}
            </>
          ),
          value: 'write',
        },
      ]}
    />
  );
}

interface PermissionChooserProps extends DefaultProps {
  permission: Permission;
  buddies: string[];
  group: string;
  setPermission: (permission: Permission) => void;
  setBuddies: (buddies: string[]) => void;
  setGroup: (group: string) => void;
  extra?: React.ReactNode;
}

export const PermissionChooser = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'> & PermissionChooserProps>(
  ({ permission, buddies, group, setPermission, setBuddies, setGroup, extra, ...others }, ref) => {
    const id = React.useMemo(() => uniqueId('PermissionChooser'), []);
    const user = userSession.currentUser();
    const roles = user ? user.roles : UserUtils.ANONYMOUS_USER.roles;
    const [advancedOpen, setAdvancedOpen] = React.useState<boolean>(false);

    return (
      <Stack ref={ref} {...others}>
        <Group sx={{ justifyContent: 'space-between' }}>
          <Radio.Group
            value={permission.others.has(EPermission.READ) ? 'public' : 'private'}
            onChange={(value) => {
              if (value === 'private') {
                const p = permission.clone();
                p.others.clear();
                setPermission(p);
              } else {
                const p = permission.clone();
                p.others.clear();
                p.others.add(EPermission.READ);
                setPermission(p);
              }
            }}
          >
            <Group>
              <Radio
                name="permission_public"
                value="private"
                id={`global_permission_private_${id}`}
                label={
                  <>
                    <i className="fas fa-user" /> {i18n.t('visyn:permission.private')}
                  </>
                }
              />
              <Radio
                name="permission_public"
                value="public"
                id={`global_permission_public_${id}`}
                label={
                  <>
                    <i className="fas fa-users" /> {i18n.t('visyn:permission.publicMsg')}
                  </>
                }
              />
            </Group>
          </Radio.Group>

          <Button variant="outline" size="xs" name="permission_advanced" onClick={() => setAdvancedOpen((o) => !o)}>
            {i18n.t('visyn:permission.advanced')}
          </Button>
        </Group>

        {extra}

        <Collapse in={advancedOpen}>
          <Box
            sx={(theme) => ({
              display: 'grid',
              // minmax helps here to make it look good across resolutions ~450 - 1800
              gridTemplateColumns: 'minmax(5rem, 0.5fr) minmax(10rem, 2fr) minmax(20rem, 1fr)',
              alignItems: 'center',
              columnGap: theme.spacing.md,
              rowGap: theme.spacing.xs,
            })}
          >
            <Text>{i18n.t('visyn:permission.public')}</Text>
            <div />
            <PermissionsEntry permission={permission} setPermission={setPermission} setGetter={(p) => p.others} />

            <Text c="dimmed" sx={{ gridColumnStart: 1, gridColumnEnd: 4 }}>
              {i18n.t('visyn:permission.definePermissions')}
            </Text>

            <Text>{i18n.t('visyn:permission.group')}</Text>
            <Select
              id={`permission_group_name_${id}`}
              name="permission_group_name"
              data={roles}
              clearable
              value={group === '' ? undefined : group}
              onChange={(e) => setGroup(e ?? '')}
            />
            <PermissionsEntry permission={permission} setPermission={setPermission} setGetter={(p) => p.group} />

            <Text c="dimmed" sx={{ gridColumnStart: 1, gridColumnEnd: 4 }}>
              {i18n.t('visyn:permission.specifyRole')}
            </Text>

            <Text>{i18n.t('visyn:permission.buddies')}</Text>
            <TextInput
              id={`permission_buddies_name_${id}`}
              name="permission_buddies_name"
              sx={{ display: 'inline-block' }}
              placeholder={i18n.t('visyn:permission.buddiesPlaceholder')}
              value={buddies.join(';')}
              onChange={(e) => setBuddies(e.currentTarget.value.split(';'))}
            />
            <PermissionsEntry permission={permission} setPermission={setPermission} setGetter={(p) => p.buddies} />

            <Text c="dimmed" sx={{ gridColumnStart: 1, gridColumnEnd: 4 }}>
              {i18n.t('visyn:permission.buddiesDescription')}
            </Text>
          </Box>
        </Collapse>
      </Stack>
    );
  },
);

PermissionChooser.displayName = 'PermissionChooser';
