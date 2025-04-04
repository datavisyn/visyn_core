import { useVisynAppContext } from '../app/VisynAppContext';
import { IUser } from '../security';

export function useVisynUser(): IUser | null {
  const { user } = useVisynAppContext();
  return user;
}
