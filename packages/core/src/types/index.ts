import { AppInfoType } from '@star-monitor-sdk/types';

export interface CoreContextType {
  app: AppInfoType;
  uploadUrl: string;
  initUrl: string;
  debug: boolean;
  enabled: boolean;
}
