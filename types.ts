
export enum ChatRole {
  User = 'user',
  Model = 'model',
}

export interface AttachedFileDisplayInfo {
  name: string;
  type: string;
}

export interface ChatMessage {
  role: ChatRole;
  text: string;
  files?: AttachedFileDisplayInfo[];
}
