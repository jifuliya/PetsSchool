
import React, { useState, useEffect, useCallback } from 'react';
import { PetData, Student, ViewState, PointLog, PointPreset, CustomPetPreset, CustomAvatarPreset, StudentAvatarAsset } from './types';
import { ICONS } from './constants';
import ClassroomView from './components/ClassroomView';
import StudentDetail from './components/StudentDetail';
import TeacherPanel from './components/TeacherPanel';
import { db } from './db';

interface AppState {
  students: Student[];
  pets: Record<string, PetData>;
  className: string;
  pointPresets: PointPreset[];
  customPetPresets: CustomPetPreset[];
  customAvatarPresets: CustomAvatarPreset[]; 
  studentPoolAvatars: StudentAvatarAsset[]; // 新增：学生头像池
}

const DEFAULT_PRESETS: PointPreset[] = [
  { id: 'p1', label: '积极发言', amount: 5 },
  { id: 'p2', label: '作业优秀', amount: 10 },
  { id: 'p3', label: '乐于助人', amount: 15 },
  { id: 'p4', label: '迟到/早退', amount: -5 },
  { id: 'p5', label: '课堂分心', amount: -10 },
];

const ConfirmModal = ({ 
  isOpen, 
  title, 
  content, 
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean; 
  title: string; 
  content: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
      <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative border-[6px] border-white ring-4 ring-indigo-50 transform transition-all scale-100 animate-[bounce_0.3s_ease-out]">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto shadow-inner">🚨</div>
        <h3 className="text-2xl font-black text-indigo-900 mb-4 text-center">{title}</h3>
        <p className="text-gray-500 font-bold mb-8 leading-relaxed text-center text-sm">{content}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-3.5 rounded-2xl font-black text-indigo-400 bg-indigo-50 hover:bg-indigo-100 transition active:scale-95">我再想想</button>
          <button onClick={onConfirm} className="flex-1 py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-200 transition transform active:scale-95">确认执行</button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [view, setView] = useState<ViewState>('classroom');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', content: '', onConfirm: () => {} });

  const [appData, setAppData] = useState<AppState>({
    students: [],
    pets: {},
    className: '我的萌宠乐园',
    pointPresets: DEFAULT_PRESETS,
    customPetPresets: [],
    customAvatarPresets: [],
    studentPoolAvatars: []
  });

  const getCuteAvatar = (name: string) => `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  useEffect(() => {
    const initData = async () => {
      try {
        await db.init();
        const students = await db.getAllStudents();
        const pets = await db.getAllPets();
        const className = await db.getConfig('className') || '我的萌宠乐园';
        const pointPresets = await db.getConfig('pointPresets') || DEFAULT_PRESETS;
        const customPetPresets = await db.getAllCustomPresets();
        const customAvatarPresets = await db.getAllCustomAvatars();
        const studentPoolAvatars = await db.getStudentPoolAvatars();

        setAppData({ students, pets, className, pointPresets, customPetPresets, customAvatarPresets, studentPoolAvatars });
        setIsDbReady(true);
      } catch (e) {
        console.error("[App] 初始化失败:", e);
        setIsDbReady(true);
      }
    };
    initData();
  }, []);

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleUpdateClassName = async (newName: string) => {
    setIsSyncing(true);
    setAppData(prev => ({ ...prev, className: newName }));
    await db.saveConfig('className', newName);
    setIsSyncing(false);
  };

  const handleAddPreset = async (label: string, amount: number) => {
    setIsSyncing(true);
    const newPreset: PointPreset = { id: `preset-${Date.now()}`, label, amount };
    setAppData(prev => {
      const nextPresets = [...prev.pointPresets, newPreset];
      db.saveConfig('pointPresets', nextPresets);
      return { ...prev, pointPresets: nextPresets };
    });
    setIsSyncing(false);
  };

  const handleDeletePreset = async (id: string) => {
    setIsSyncing(true);
    setAppData(prev => {
      const nextPresets = prev.pointPresets.filter(p => p.id !== id);
      db.saveConfig('pointPresets', nextPresets);
      return { ...prev, pointPresets: nextPresets };
    });
    setIsSyncing(false);
  };

  const handleAddCustomPet = async (name: string, images: string[]) => {
    setIsSyncing(true);
    const newCustomPet: CustomPetPreset = { id: `custom-${Date.now()}`, name, images };
    await db.saveCustomPreset(newCustomPet);
    setAppData(prev => ({ ...prev, customPetPresets: [...prev.customPetPresets, newCustomPet] }));
    setIsSyncing(false);
  };

  const handleDeleteCustomPet = async (id: string) => {
    setIsSyncing(true);
    await db.deleteCustomPreset(id);
    setAppData(prev => ({ ...prev, customPetPresets: prev.customPetPresets.filter(p => p.id !== id) }));
    setIsSyncing(false);
  };

  const handleAddCustomAvatar = async (name: string, image: string) => {
    setIsSyncing(true);
    const newAvatar: CustomAvatarPreset = { id: `avatar-${Date.now()}-${Math.random()}`, name, image };
    await db.saveCustomAvatar(newAvatar);
    setAppData(prev => ({ ...prev, customAvatarPresets: [...prev.customAvatarPresets, newAvatar] }));
    setIsSyncing(false);
  };

  const handleDeleteCustomAvatar = async (id: string) => {
    setIsSyncing(true);
    await db.deleteCustomAvatar(id);
    setAppData(prev => ({ ...prev, customAvatarPresets: prev.customAvatarPresets.filter(a => a.id !== id) }));
    setIsSyncing(false);
  };

  // 新增：处理学生头像池的添加 (带FIFO逻辑)
  const handleAddStudentPoolAvatars = async (images: string[]) => {
    setIsSyncing(true);
    const newAssets: StudentAvatarAsset[] = images.map(img => ({
        id: `pool-${Date.now()}-${Math.random()}`,
        image: img,
        timestamp: Date.now()
    }));
    await db.saveStudentPoolAvatars(newAssets);
    const updatedPool = await db.getStudentPoolAvatars();
    setAppData(prev => ({ ...prev, studentPoolAvatars: updatedPool }));
    setIsSyncing(false);
  };

  const handleAdopt = async (studentId: string, petName: string, initialImages: string[]) => {
    setIsSyncing(true);
    const newPet: PetData = {
      id: studentId,
      name: petName,
      stage: 0,
      progress: 0,
      points: 10,
      food: 0,
      customImages: initialImages,
      isAdopted: true,
      adoptionDate: new Date().toLocaleDateString(),
      logs: [{ id: Date.now().toString(), amount: 10, reason: '初始领养奖励', timestamp: new Date().toLocaleString() }]
    };
    setAppData(prev => ({ ...prev, pets: { ...prev.pets, [studentId]: newPet } }));
    await db.savePet(newPet);
    setIsSyncing(false);
  };

  const handleUpdatePet = useCallback(async (studentId: string, updater: (pet: PetData) => PetData) => {
    setIsSyncing(true);
    let petToSave: PetData | null = null;
    setAppData(prev => {
      const currentPet = prev.pets[studentId];
      if (!currentPet) return prev;
      petToSave = updater(currentPet);
      return { ...prev, pets: { ...prev.pets, [studentId]: petToSave } };
    });
    if (petToSave) await db.savePet(petToSave);
    setIsSyncing(false);
  }, []);

  const handleGivePoints = useCallback(async (studentId: string, amount: number, reason: string) => {
    await handleUpdatePet(studentId, (pet) => ({ 
      ...pet, 
      points: pet.points + amount,
      logs: [{ id: Date.now().toString(), amount, reason, timestamp: new Date().toLocaleString() }, ...pet.logs].slice(0, 50)
    }));
  }, [handleUpdatePet]);

  const handleUpdateStudent = async (updatedStudent: Student) => {
    setIsSyncing(true);
    setAppData(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    }));
    await db.saveStudent(updatedStudent);
    setIsSyncing(false);
  };

  const handleAddStudent = async (name: string, gender: 'boy' | 'girl', avatar: string) => {
    setIsSyncing(true);
    const newId = `S${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newStudent: Student = { 
        id: newId, 
        name, 
        gender,
        avatar // 使用传入的具体头像
    };
    setAppData(prev => ({ ...prev, students: [...prev.students, newStudent] }));
    await db.saveStudent(newStudent);
    setIsSyncing(false);
  };

  const executeDeleteStudent = useCallback(async (id: string) => {
    setIsSyncing(true);
    const targetId = String(id);
    closeModal(); 
    setAppData(prev => {
      const nextStudents = prev.students.filter(s => String(s.id) !== targetId);
      const nextPets = { ...prev.pets };
      delete nextPets[targetId];
      return { ...prev, students: nextStudents, pets: nextPets };
    });
    setSelectedStudentId(null);
    try {
      await db.deleteStudent(targetId);
      await db.deletePet(targetId);
    } catch (err) {
      console.error("[App] DB Delete Error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleDeleteStudent = useCallback((id: string) => {
    setModalConfig({
      isOpen: true,
      title: '🚨 删除确认',
      content: '确定要移除这位同学吗？与之关联的萌宠成长记录和积分数据都将永久消失，无法找回。',
      onConfirm: () => executeDeleteStudent(id)
    });
  }, [executeDeleteStudent]);

  const executeClearAll = useCallback(async () => {
    setIsSyncing(true);
    closeModal();
    try {
      setAppData({ students: [], pets: {}, className: '我的萌宠乐园', pointPresets: DEFAULT_PRESETS, customPetPresets: [], customAvatarPresets: [], studentPoolAvatars: [] });
      setSelectedStudentId(null);
      setView('classroom');
      await db.clearAll();
    } catch (err) {
      console.error("[App] Clear Error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleClearAllStudents = useCallback(() => {
    setModalConfig({
      isOpen: true,
      title: '⚠️ 极度危险操作',
      content: '这将清空全班所有的学生、宠物以及导入的自定义资源数据！操作后一切将回归初始状态，确定要继续吗？',
      onConfirm: () => executeClearAll()
    });
  }, [executeClearAll]);

  const handleSelectStudent = (id: string | null) => {
    setSelectedStudentId(id);
    if (id) setView('student-detail');
    else setView('classroom');
  };

  if (!isDbReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF4FF]">
        <div className="text-9xl pet-bounce mb-8">🔮</div>
        <h2 className="text-3xl font-black text-indigo-900 title-font animate-pulse">正在唤醒魔法数据库...</h2>
      </div>
    );
  }

  const currentPet = selectedStudentId ? appData.pets[selectedStudentId] : null;
  const currentStudent = selectedStudentId ? appData.students.find(s => s.id === selectedStudentId) : null;

  return (
    <div className="min-h-screen pb-24 relative overflow-x-hidden">
      <ConfirmModal isOpen={modalConfig.isOpen} title={modalConfig.title} content={modalConfig.content} onConfirm={modalConfig.onConfirm} onCancel={closeModal} />
      <header className="immersive-header sticky top-0 z-50 p-4 border-b-4 border-white flex justify-between items-center px-4 md:px-12">
        <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-pink-400 to-yellow-300 p-2.5 rounded-[1.5rem] shadow-xl pet-bounce"><ICONS.Trophy className="w-8 h-8 text-white drop-shadow-md" /></div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-4xl font-black text-indigo-900 title-font tracking-widest drop-shadow-sm">{appData.className}</h1>
                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}></div>
              </div>
            </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => { setView('classroom'); setSelectedStudentId(null); }} className={`cute-btn-press px-6 py-3 rounded-[1.5rem] font-black flex items-center gap-2 transition-all ${view === 'classroom' ? 'bg-indigo-500 text-white shadow-[0_6px_0_#4338ca]' : 'bg-white/80 text-indigo-400 border-2 border-indigo-100'}`}>
            <ICONS.Home className="w-5 h-5" /><span className="hidden sm:inline">萌宠乐园</span>
          </button>
          <button onClick={() => setView('teacher-admin')} className={`cute-btn-press px-6 py-3 rounded-[1.5rem] font-black flex items-center gap-2 transition-all ${view === 'teacher-admin' ? 'bg-pink-500 text-white shadow-[0_6px_0_#be185d]' : 'bg-white/80 text-pink-400 border-2 border-pink-100'}`}>
            <ICONS.Settings className="w-5 h-5" /><span className="hidden sm:inline">教师管理</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-12 relative z-10">
        {view === 'classroom' && <ClassroomView students={appData.students} pets={appData.pets} className={appData.className} onSelectStudent={handleSelectStudent} />}
        {view === 'student-detail' && currentStudent && (
          <StudentDetail 
            student={currentStudent} 
            pet={currentPet} 
            customPresets={appData.customPetPresets} 
            onAdopt={(name, imgs) => handleAdopt(currentStudent.id, name, imgs)} 
            onUpdatePet={(updater) => handleUpdatePet(currentStudent.id, updater)} 
            onBack={() => { handleSelectStudent(null); }} 
          />
        )}
        {view === 'teacher-admin' && (
          <TeacherPanel 
            students={appData.students} 
            pets={appData.pets} 
            className={appData.className} 
            pointPresets={appData.pointPresets} 
            customPresets={appData.customPetPresets} 
            customAvatarPresets={appData.customAvatarPresets} 
            studentPoolAvatars={appData.studentPoolAvatars}
            onAddPreset={handleAddPreset} 
            onDeletePreset={handleDeletePreset} 
            onAddCustomPet={handleAddCustomPet} 
            onDeleteCustomPet={handleDeleteCustomPet} 
            onAddCustomAvatar={handleAddCustomAvatar} 
            onDeleteCustomAvatar={handleDeleteCustomAvatar} 
            onAddStudentPoolAvatars={handleAddStudentPoolAvatars} // 新增
            onUpdateClassName={handleUpdateClassName} 
            onGivePoints={handleGivePoints} 
            onUpdateStudent={handleUpdateStudent} 
            onAddStudent={handleAddStudent} 
            onDeleteStudent={handleDeleteStudent} 
            onClearAllStudents={handleClearAllStudents} 
            onBack={() => setView('classroom')} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
