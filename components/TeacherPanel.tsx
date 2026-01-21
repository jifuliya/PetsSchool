
import React, { useState, useRef, useMemo } from 'react';
import { Student, PetData, PointPreset, CustomPetPreset, CustomAvatarPreset, StudentAvatarAsset } from '../types';
import { ICONS } from '../constants';

interface Props {
  students: Student[];
  pets: Record<string, PetData>;
  className: string;
  pointPresets: PointPreset[];
  customPresets: CustomPetPreset[];
  customAvatarPresets: CustomAvatarPreset[];
  studentPoolAvatars: StudentAvatarAsset[]; // 系统的学生头像池
  onAddPreset: (label: string, amount: number) => void;
  onDeletePreset: (id: string) => void;
  onAddCustomPet: (name: string, images: string[]) => Promise<void>;
  onDeleteCustomPet: (id: string) => Promise<void>;
  onAddCustomAvatar: (name: string, image: string) => Promise<void>;
  onDeleteCustomAvatar: (id: string) => Promise<void>;
  onAddStudentPoolAvatars: (images: string[]) => Promise<void>; // 上传新头像到池子
  onUpdateClassName: (name: string) => void;
  onGivePoints: (studentId: string, amount: number, reason: string) => void;
  onUpdateStudent: (student: Student) => void;
  onAddStudent: (name: string, gender: 'boy' | 'girl', avatar: string) => void; // 修改签名
  onDeleteStudent: (id: string) => void;
  onClearAllStudents: () => void;
  onBack: () => void;
}

const CollapsibleCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  canCollapse?: boolean;
  borderColorClass?: string;
  headerBgClass?: string;
  compact?: boolean;
  extraHeader?: React.ReactNode;
}> = ({ 
  title, 
  icon, 
  children, 
  defaultExpanded = true, 
  canCollapse = true,
  borderColorClass = "border-indigo-100", 
  headerBgClass = "from-white to-indigo-50/30", 
  compact = false,
  extraHeader 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const showContent = canCollapse ? isExpanded : true;

  return (
    <div className={`cute-card overflow-hidden transition-all duration-300 border-4 ${borderColorClass}`}>
      <div 
        onClick={() => canCollapse && setIsExpanded(!isExpanded)}
        className={`w-full ${compact ? 'p-4' : 'p-6'} bg-gradient-to-r ${headerBgClass} flex items-center justify-between transition-all focus:outline-none group ${canCollapse ? 'cursor-pointer hover:brightness-95' : 'cursor-default'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`bg-white ${compact ? 'p-2' : 'p-3'} rounded-[1.5rem] shadow-sm ${canCollapse ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>{icon}</div>
          <h3 className={`font-black text-indigo-900 ${compact ? 'text-lg' : 'text-xl md:text-2xl'} tracking-tight`}>{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          {canCollapse && (
            <div className={`p-1.5 rounded-full bg-white/50 transition-transform duration-500 ${isExpanded ? 'rotate-180 scale-110' : 'scale-90'}`}>
              <ICONS.ChevronDown className="w-6 h-6 text-indigo-400" />
            </div>
          )}
        </div>
      </div>
      {extraHeader && <div className="px-6 pb-4 border-b-2 border-dashed border-indigo-50">{extraHeader}</div>}
      <div className={`grid transition-all duration-500 ease-in-out ${showContent ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className={`${compact ? 'p-6' : 'p-8'} border-t-2 border-dashed border-indigo-50`}>{children}</div>
        </div>
      </div>
    </div>
  );
};

// 新增：学生创建弹窗组件
const StudentCreationModal: React.FC<{
  name: string;
  isOpen: boolean;
  poolAvatars: StudentAvatarAsset[];
  onConfirm: (gender: 'boy' | 'girl', avatar: string) => void;
  onCancel: () => void;
}> = ({ name, isOpen, poolAvatars, onConfirm, onCancel }) => {
  const [gender, setGender] = useState<'boy' | 'girl'>('boy');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  
  // 默认选中第一个
  React.useEffect(() => {
    if (isOpen && !selectedAvatar && poolAvatars.length > 0) {
        setSelectedAvatar(poolAvatars[0].image);
    }
  }, [isOpen, poolAvatars, selectedAvatar]);

  React.useEffect(() => {
    if (!selectedAvatar && poolAvatars.length > 0) {
         setSelectedAvatar(poolAvatars[0].image);
    }
  }, [poolAvatars, selectedAvatar]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="bg-white rounded-[2.5rem] p-8 max-w-3xl w-full shadow-2xl relative border-[6px] border-white ring-4 ring-indigo-50 flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
         <h3 className="text-3xl font-black text-indigo-900 text-center">📝 新生档案设置: {name}</h3>
         
         {/* 性别选择 */}
         <div className="bg-indigo-50 rounded-2xl p-4">
           <label className="text-xs font-black text-indigo-300 uppercase tracking-widest px-1 mb-2 block">Step 1: 性别</label>
           <div className="flex gap-4">
             <button onClick={() => setGender('boy')} className={`flex-1 py-4 rounded-xl font-black text-lg transition-all border-4 ${gender === 'boy' ? 'bg-blue-100 text-blue-600 border-blue-300 shadow-md' : 'bg-white text-gray-400 border-transparent hover:bg-gray-50'}`}>👦 男生</button>
             <button onClick={() => setGender('girl')} className={`flex-1 py-4 rounded-xl font-black text-lg transition-all border-4 ${gender === 'girl' ? 'bg-pink-100 text-pink-600 border-pink-300 shadow-md' : 'bg-white text-gray-400 border-transparent hover:bg-gray-50'}`}>👧 女生</button>
           </div>
         </div>

         {/* 头像选择 */}
         <div className="bg-indigo-50 rounded-2xl p-4 flex-1">
           <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-black text-indigo-300 uppercase tracking-widest px-1">Step 2: 形象选择</label>
           </div>
           
           <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 min-h-[10rem]">
              {poolAvatars.length > 0 ? (
                poolAvatars.map((asset) => (
                    <button key={asset.id} onClick={() => setSelectedAvatar(asset.image)} className={`aspect-square rounded-xl overflow-hidden border-4 transition-all ${selectedAvatar === asset.image ? 'border-indigo-500 shadow-lg scale-105' : 'border-white opacity-70 hover:opacity-100'}`}>
                    <img src={asset.image} className="w-full h-full object-cover bg-white" alt="avatar" />
                    </button>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-indigo-200 rounded-2xl bg-white/50">
                     <span className="text-4xl opacity-50 mb-2">🖼️</span>
                     <p className="text-indigo-400 font-black text-sm">暂无可用形象</p>
                     <p className="text-gray-400 text-xs mt-1">请联系老师先上传形象资源</p>
                </div>
              )}
           </div>
           <p className="text-[10px] text-gray-400 mt-2 text-right">可用形象: {poolAvatars.length}/30</p>
         </div>

         <div className="flex gap-4 pt-2">
            <button onClick={onCancel} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200">取消</button>
            <button disabled={!selectedAvatar} onClick={() => onConfirm(gender, selectedAvatar)} className="flex-[2] py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-black shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">确认入园 🎉</button>
         </div>
      </div>
    </div>
  );
};


const TeacherPanel: React.FC<Props> = ({ 
  students, pets, className, pointPresets, customPresets, customAvatarPresets, studentPoolAvatars,
  onAddPreset, onDeletePreset, onAddCustomPet, onDeleteCustomPet, onAddCustomAvatar, onDeleteCustomAvatar, onAddStudentPoolAvatars,
  onUpdateClassName, onGivePoints, onUpdateStudent, onAddStudent, onDeleteStudent, onClearAllStudents, onBack 
}) => {
  const [pointAmount, setPointAmount] = useState<number>(5);
  const [pointReason, setPointReason] = useState<string>('表现优异');
  const [newStudentName, setNewStudentName] = useState('');
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false); // 控制弹窗
  
  const [tempClassName, setTempClassName] = useState(className);
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetAmount, setNewPresetAmount] = useState<number>(5);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [presetSearchQuery, setPresetSearchQuery] = useState('');
  const [customPetName, setCustomPetName] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isProcessingPoolImages, setIsProcessingPoolImages] = useState(false);

  const handleAddClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim()) {
      setIsCreationModalOpen(true);
    }
  };

  const handleCreationConfirm = (gender: 'boy' | 'girl', avatar: string) => {
    onAddStudent(newStudentName.trim(), gender, avatar);
    setNewStudentName('');
    setIsCreationModalOpen(false);
  };

  const handlePoolUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingPoolImages(true);
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 10);
    const promises = fileArray.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    }));
    const base64Images = await Promise.all(promises);
    await onAddStudentPoolAvatars(base64Images);
    setIsProcessingPoolImages(false);
    // Reset input
    e.target.value = '';
  };

  const handleAddPresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPresetLabel.trim()) {
      onAddPreset(newPresetLabel.trim(), newPresetAmount);
      setNewPresetLabel('');
      setNewPresetAmount(5);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingImages(true);
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    fileArray.sort((a, b) => (parseInt(a.name.replace(/\D/g, '')) || 0) - (parseInt(b.name.replace(/\D/g, '')) || 0));
    const promises = fileArray.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    }));
    const base64Images = await Promise.all(promises);
    let finalImages = base64Images;
    while (finalImages.length > 0 && finalImages.length < 10) finalImages.push(finalImages[finalImages.length - 1]);
    setUploadedImages(finalImages.slice(0, 10));
    setIsProcessingImages(false);
  };

  const allLogs = useMemo(() => {
    const logs: any[] = [];
    students.forEach(student => {
      const pet = pets[student.id];
      if (pet && pet.logs) pet.logs.forEach(log => logs.push({ ...log, studentName: student.name, studentId: student.id }));
    });
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [students, pets]);

  const filteredLogs = useMemo(() => allLogs.filter(log => !logSearchQuery || log.studentName.toLowerCase().includes(logSearchQuery.toLowerCase()) || log.reason.toLowerCase().includes(logSearchQuery.toLowerCase())), [allLogs, logSearchQuery]);
  const filteredPresets = useMemo(() => pointPresets.filter(p => !presetSearchQuery || p.label.toLowerCase().includes(presetSearchQuery.toLowerCase())), [pointPresets, presetSearchQuery]);

  return (
    <div className="space-y-12 pb-20 relative">
      <StudentCreationModal 
        isOpen={isCreationModalOpen} 
        name={newStudentName} 
        poolAvatars={studentPoolAvatars}
        onConfirm={handleCreationConfirm}
        onCancel={() => setIsCreationModalOpen(false)}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-4xl font-black text-indigo-900 title-font flex items-center gap-4">
          <div className="bg-pink-100 p-4 rounded-[2rem] shadow-xl pet-bounce"><ICONS.Settings className="text-pink-500 w-10 h-10 drop-shadow-sm" /></div>
          乐园调度中心
        </h2>
        <button onClick={onBack} className="cute-btn-press bg-white text-indigo-600 px-10 py-4 rounded-[2rem] font-black border-4 border-indigo-100 shadow-[0_8px_0_#e0e7ff] hover:shadow-[0_12px_0_#e0e7ff] hover:-translate-y-1 transition-all">返回乐园主页</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <CollapsibleCard title="乐园冠名" icon={<span className="text-xl">🍭</span>} borderColorClass="border-pink-200" headerBgClass="from-pink-50 to-white" compact={true}>
          <input type="text" className="w-full px-4 py-3 bg-white/50 border-4 border-pink-50 focus:border-pink-200 rounded-2xl outline-none font-black text-indigo-800 shadow-inner" value={tempClassName} onChange={(e) => setTempClassName(e.target.value)} onBlur={() => onUpdateClassName(tempClassName)} />
        </CollapsibleCard>
        <div className="md:col-span-2 lg:col-span-2">
          <CollapsibleCard title="入园登记 · 新伙伴加入" icon={<span className="text-xl">🎒</span>} borderColorClass="border-blue-200" headerBgClass="from-blue-50 to-white" compact={true}>
             <form onSubmit={handleAddClick} className="flex flex-col sm:flex-row gap-4">
                <input type="text" placeholder="请输入新成员的可爱姓名..." className="flex-1 px-5 py-3.5 bg-white/50 border-4 border-blue-50 rounded-2xl focus:border-blue-200 outline-none font-black text-indigo-800 shadow-inner" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} />
                <button type="submit" disabled={!newStudentName.trim()} className="cute-btn-press bg-blue-500 text-white px-10 py-3.5 rounded-2xl font-black shadow-lg">欢迎入园</button>
             </form>
          </CollapsibleCard>
        </div>
      </div>

      <CollapsibleCard title="👕 形象资源库管理 (入学照片池)" icon={<span className="text-2xl">🎩</span>} borderColorClass="border-blue-200" headerBgClass="from-blue-50 to-white">
        <div className="space-y-6">
          <div className="bg-blue-50/50 p-6 rounded-3xl border-2 border-dashed border-blue-200">
             <label className="text-xs font-black text-blue-400 uppercase tracking-widest px-1 mb-2 block">批量上传形象 (Max 30张，自动覆盖最早)</label>
             <div className="relative group">
                <input type="file" multiple accept="image/*" onChange={handlePoolUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="w-full py-8 border-4 border-dashed border-blue-200 rounded-2xl bg-white flex flex-col items-center justify-center gap-2 group-hover:border-blue-400 transition-colors">
                   <span className="text-4xl">{isProcessingPoolImages ? '⏳' : '🖼️'}</span>
                   <span className="text-sm font-black text-blue-400">点击或拖入多张图片</span>
                </div>
             </div>
          </div>
          {studentPoolAvatars.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {studentPoolAvatars.map(avatar => (
                <div key={avatar.id} className="relative group bg-white p-1 rounded-xl border-2 border-blue-50 shadow-sm aspect-square overflow-hidden">
                  <img src={avatar.image} className="w-full h-full object-cover rounded-lg" />
                </div>
              ))}
            </div>
          )}
          <p className="text-right text-xs font-bold text-blue-300">当前库存: {studentPoolAvatars.length}/30</p>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="📂 导入自定义宠物包" icon={<span className="text-2xl">📦</span>} borderColorClass="border-purple-200" headerBgClass="from-purple-50 to-white">
        <div className="space-y-6">
          <div className="bg-purple-50/50 p-6 rounded-3xl border-2 border-dashed border-purple-200 flex flex-col lg:flex-row gap-6">
             <div className="flex-1 space-y-4">
                <input type="text" placeholder="宠物物种名称..." value={customPetName} onChange={(e) => setCustomPetName(e.target.value)} className="w-full px-5 py-3 bg-white border-2 border-purple-100 rounded-xl focus:border-purple-300 outline-none font-black" />
                <div className="relative group">
                   {/* Using any cast to bypass React TS definition for webkitdirectory */}
                   <input type="file" multiple {...({ webkitdirectory: "" } as any)} onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                   <div className="w-full py-8 border-4 border-dashed border-purple-200 rounded-2xl bg-white flex flex-col items-center justify-center gap-2">
                      <span className="text-4xl">📂</span>
                      <span className="text-sm font-black text-purple-400">选择宠物成长文件夹 (10张图)</span>
                   </div>
                </div>
             </div>
             <div className="w-full lg:w-1/2 space-y-4">
                <button onClick={() => { onAddCustomPet(customPetName, uploadedImages); setCustomPetName(''); setUploadedImages([]); }} disabled={!customPetName || uploadedImages.length === 0} className="w-full bg-purple-500 text-white py-3 rounded-xl font-black">确认保存资源包</button>
                <div className="grid grid-cols-5 gap-2 bg-white p-2 rounded-xl min-h-[100px]">
                  {uploadedImages.map((src, idx) => <img key={idx} src={src} className="aspect-square object-cover rounded-lg" />)}
                </div>
             </div>
          </div>
          {customPresets.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {customPresets.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl border-2 border-purple-50 relative group">
                  <button onClick={() => onDeleteCustomPet(p.id)} className="absolute -top-2 -right-2 bg-red-400 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">×</button>
                  <img src={p.images[0]} className="w-full aspect-square object-cover rounded-xl" />
                  <p className="text-center font-black text-xs mt-1 truncate">{p.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="🪄 奇迹分发站" icon={<span className="text-3xl">🪄</span>} borderColorClass="border-yellow-300" headerBgClass="from-yellow-50 to-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
                <div className="bg-yellow-50/50 p-8 rounded-[3rem] border-4 border-white shadow-inner space-y-4">
                  <input type="text" className="w-full px-6 py-4 bg-white border-4 border-yellow-100 rounded-3xl font-black text-2xl" value={pointReason} onChange={(e) => setPointReason(e.target.value)} />
                  <input type="number" className="w-full px-6 py-4 bg-white border-4 border-yellow-100 rounded-3xl font-black text-4xl text-center" value={pointAmount} onChange={(e) => setPointAmount(parseInt(e.target.value) || 0)} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredPresets.map(preset => (
                    <button key={preset.id} onClick={() => { setPointReason(preset.label); setPointAmount(preset.amount); }} className={`p-4 rounded-[1.5rem] border-4 transition-all ${pointReason === preset.label && pointAmount === preset.amount ? 'bg-indigo-50 border-indigo-400' : 'bg-white border-gray-50'}`}>
                      <span className="font-black text-sm truncate block">{preset.label}</span>
                      <span className={`text-xs font-black ${preset.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{preset.amount > 0 ? `+${preset.amount}` : preset.amount}</span>
                    </button>
                  ))}
                </div>
            </div>
            <div className="bg-white rounded-[3rem] border-8 border-indigo-50/50 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-indigo-50/80 text-[10px] uppercase font-black">
                  <tr><th className="px-6 py-5">小主人</th><th className="px-6 py-5 text-center">魔法值</th><th className="px-6 py-5 text-right">管理</th></tr>
                </thead>
                <tbody className="divide-y divide-indigo-50">
                  {students.map(student => (
                    <tr key={student.id} className="group hover:bg-indigo-50/30">
                      <td className="px-6 py-5"><div className="flex items-center gap-4"><img src={student.avatar} className="w-12 h-12 rounded-[1rem] object-cover" /> <span className="font-black text-indigo-900">{student.name}</span></div></td>
                      <td className="px-6 py-5 text-center font-black">{pets[student.id]?.points || 0}</td>
                      <td className="px-6 py-5 text-right"><button onClick={() => onGivePoints(student.id, pointAmount, pointReason)} className={`p-3 rounded-2xl text-white ${pointAmount >= 0 ? 'bg-amber-400' : 'bg-red-400'}`}><ICONS.Plus className="w-6 h-6" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </CollapsibleCard>

      <div className="flex flex-col items-center gap-4 pt-10">
          <button onClick={onClearAllStudents} className="text-sm text-red-300 font-black px-8 py-3 bg-red-50/30 rounded-full hover:bg-red-50 transition-all border-2 border-transparent hover:border-red-100">⚠️ 彻底格式化乐园星系</button>
      </div>
    </div>
  );
};

export default TeacherPanel;
