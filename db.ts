
import { Student, PetData, PointPreset, CustomPetPreset, CustomAvatarPreset, StudentAvatarAsset } from './types';

const DB_NAME = 'PetGalaxyDB_V12'; 
const DB_VERSION = 1;
const STORES = {
  CONFIG: 'app_config',
  STUDENTS: 'students',
  PETS: 'pets',
  CUSTOM_PRESETS: 'custom_presets',
  CUSTOM_AVATARS: 'custom_avatars', // 这里的 naming 稍微有点混淆，保留原有的 custom_avatars 给“形象资源库”，新建一个专门给学生头像池
  STUDENT_POOL_AVATARS: 'student_pool_avatars' 
};

export class LocalDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const currentStores = Array.from(db.objectStoreNames);
        Object.values(STORES).forEach(name => {
          if (currentStores.includes(name)) db.deleteObjectStore(name);
        });

        db.createObjectStore(STORES.CONFIG);
        db.createObjectStore(STORES.STUDENTS, { keyPath: 'id' });
        db.createObjectStore(STORES.PETS, { keyPath: 'id' });
        db.createObjectStore(STORES.CUSTOM_PRESETS, { keyPath: 'id' });
        db.createObjectStore(STORES.CUSTOM_AVATARS, { keyPath: 'id' });
        db.createObjectStore(STORES.STUDENT_POOL_AVATARS, { keyPath: 'id' }); // 新增：学生头像池
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log("[DB] V12 存储引擎就绪");
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveConfig(key: string, value: any): Promise<void> {
    return this.put(STORES.CONFIG, value, String(key));
  }

  async getConfig(key: string): Promise<any> {
    return this.get(STORES.CONFIG, String(key));
  }

  async saveStudent(student: Student): Promise<void> {
    return this.put(STORES.STUDENTS, student);
  }

  async getAllStudents(): Promise<Student[]> {
    return this.getAll(STORES.STUDENTS);
  }

  async deleteStudent(id: string): Promise<void> {
    return this.delete(STORES.STUDENTS, String(id));
  }

  async savePet(pet: PetData): Promise<void> {
    return this.put(STORES.PETS, pet);
  }

  async getPet(id: string): Promise<PetData | null> {
    return this.get(STORES.PETS, String(id));
  }

  async getAllPets(): Promise<Record<string, PetData>> {
    const petsArr = await this.getAll(STORES.PETS);
    return petsArr.reduce((acc, pet) => {
      if (pet && pet.id) acc[String(pet.id)] = pet;
      return acc;
    }, {} as Record<string, PetData>);
  }

  async deletePet(id: string): Promise<void> {
    return this.delete(STORES.PETS, String(id));
  }

  // --- 宠物资源包 ---
  async saveCustomPreset(preset: CustomPetPreset): Promise<void> {
    return this.put(STORES.CUSTOM_PRESETS, preset);
  }

  async getAllCustomPresets(): Promise<CustomPetPreset[]> {
    return this.getAll(STORES.CUSTOM_PRESETS);
  }

  async deleteCustomPreset(id: string): Promise<void> {
    return this.delete(STORES.CUSTOM_PRESETS, String(id));
  }

  // --- 头像资源包 (旧接口保留，用于 StudentDetail 定制) ---
  async saveCustomAvatar(preset: CustomAvatarPreset): Promise<void> {
    return this.put(STORES.CUSTOM_AVATARS, preset);
  }

  async getAllCustomAvatars(): Promise<CustomAvatarPreset[]> {
    return this.getAll(STORES.CUSTOM_AVATARS);
  }

  async deleteCustomAvatar(id: string): Promise<void> {
    return this.delete(STORES.CUSTOM_AVATARS, String(id));
  }

  // --- 新增：学生头像池 (用于新建学生时选择，限制30张) ---
  async getStudentPoolAvatars(): Promise<StudentAvatarAsset[]> {
    return this.getAll(STORES.STUDENT_POOL_AVATARS);
  }

  /**
   * 保存新的头像到池中，确保总数不超过30。
   * 如果超过，删除最早的图片。
   */
  async saveStudentPoolAvatars(newAssets: StudentAvatarAsset[]): Promise<void> {
    if (!this.db) throw new Error("DB not ready");

    const allAssets = (await this.getAll(STORES.STUDENT_POOL_AVATARS)) as StudentAvatarAsset[];
    // 合并并按时间戳排序 (旧 -> 新)
    const combined = [...allAssets, ...newAssets].sort((a, b) => a.timestamp - b.timestamp);
    
    // 如果超过30，切掉头部的（最早的）
    const limit = 30;
    const toKeep = combined.length > limit ? combined.slice(combined.length - limit) : combined;
    const toDelete = combined.length > limit ? combined.slice(0, combined.length - limit) : [];

    // 执行事务
    return new Promise((resolve, reject) => {
        if (!this.db) return reject("DB Error");
        const transaction = this.db.transaction(STORES.STUDENT_POOL_AVATARS, 'readwrite');
        const store = transaction.objectStore(STORES.STUDENT_POOL_AVATARS);

        // 删除旧的
        toDelete.forEach(asset => store.delete(asset.id));
        // 保存新的 (这里只保存 newAssets 里存在的且在 toKeep 里的，其实直接把 toKeep 里属于 newAssets 的 put 进去就行，
        // 但为了简单，我们可以重新 put 所有 keep 的，或者只 put new assets that survived pruning)
        // 最安全的做法：删除该删的，写入新来的
        newAssets.forEach(asset => {
             // 只有当它在保留列表中时才写入（防止刚加进来就被删了的情况，虽然逻辑上新加的时间戳肯定最大，除非系统时间回调）
             if (toKeep.find(k => k.id === asset.id)) {
                 store.put(asset);
             }
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
  }

  async clearAll(): Promise<void> {
    await this.clear(STORES.CONFIG);
    await this.clear(STORES.STUDENTS);
    await this.clear(STORES.PETS);
    await this.clear(STORES.CUSTOM_PRESETS);
    await this.clear(STORES.CUSTOM_AVATARS);
    await this.clear(STORES.STUDENT_POOL_AVATARS);
  }

  private async put(storeName: string, value: any, key?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("DB not ready");
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async get(storeName: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("DB not ready");
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAll(storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("DB not ready");
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async delete(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("DB not ready");
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => {};
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("DB not ready");
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const db = new LocalDatabase();
