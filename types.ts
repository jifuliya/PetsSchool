
export interface PointLog {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface PointPreset {
  id: string;
  label: string;
  amount: number;
}

export interface PetData {
  id: string; // matches student id/name
  name: string;
  stage: number; // 0 to 9
  progress: number; // 0 to 100 within a stage
  points: number;
  food: number;
  customImages: string[]; // Base64 or URLs for 10 stages
  isAdopted: boolean;
  adoptionDate: string;
  logs: PointLog[]; // 记录积分变更历史
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  gender: 'boy' | 'girl'; // 新增性别
  extraInfo?: string;
}

export interface CustomPetPreset {
  id: string;
  name: string;
  images: string[]; // Array of 10 Base64 strings
}

export interface CustomAvatarPreset {
  id: string;
  name: string;
  image: string; // Base64 string
}

// 新增：学生头像资源库（带有时间戳以便清理旧数据）
export interface StudentAvatarAsset {
  id: string;
  image: string; // Base64
  timestamp: number;
}

export type ViewState = 'classroom' | 'student-detail' | 'teacher-admin';
