
import React, { useState, useEffect, useMemo } from 'react';
import { Student, PetData, PointLog, CustomPetPreset } from '../types';
import { ICONS } from '../constants';
import Poster from './Poster';

interface Props {
  student: Student;
  pet: PetData | null;
  customPresets: CustomPetPreset[]; 
  onAdopt: (name: string, initialImages: string[]) => void;
  onUpdatePet: (updater: (pet: PetData) => PetData) => void;
  onBack: () => void;
}

const StudentDetail: React.FC<Props> = ({ student, pet, customPresets = [], onAdopt, onUpdatePet, onBack }) => {
  // 仅使用上传的自定义宠物数据，移除 PRESET_ANIMALS
  const allPetOptions = useMemo(() => {
    return customPresets.map(p => ({
      id: p.id,
      name: p.name,
      urls: p.images
    }));
  }, [customPresets]);

  const [adoptionName, setAdoptionName] = useState('');
  const [selectedPet, setSelectedPet] = useState(allPetOptions[0] || null);
  
  // 当选项变化时（例如从无到有），自动选中第一个
  useEffect(() => {
      if (!selectedPet && allPetOptions.length > 0) {
          setSelectedPet(allPetOptions[0]);
      }
  }, [allPetOptions, selectedPet]);

  // 领养界面逻辑
  if (!pet) {
    const handleConfirmAdopt = () => {
      if (!adoptionName.trim() || !selectedPet) return;
      onAdopt(adoptionName, [...selectedPet.urls]);
    };

    return (
      <div className="max-w-6xl mx-auto cute-card bg-white p-8 md:p-14 border-indigo-100 shadow-2xl relative">
        <div className="absolute -top-12 -left-12 text-7xl pet-bounce">🎈</div>
        <div className="absolute -bottom-12 -right-12 text-7xl floating-bubble">🎁</div>
        
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-2/5 space-y-10 flex flex-col items-center">
            {allPetOptions.length > 0 && selectedPet ? (
                <>
                <div className="bg-indigo-50/50 p-10 rounded-[4rem] border-4 border-white shadow-inner w-full relative">
                <div className="mb-8 relative">
                    <img 
                        src={selectedPet.urls[0]} 
                        className="w-64 h-64 md:w-80 md:h-80 mx-auto object-cover rounded-[4rem] shadow-2xl border-8 border-white pet-bounce" 
                        alt="Preview" 
                        onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        // 防止死循环，只设置一次
                        if (!img.src.includes('svg')) {
                            img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23f3f4f6"/><text y="40%" x="50%" dy="0.3em" text-anchor="middle" font-size="12" fill="%239ca3af">图片失效</text><text y="60%" x="50%" dy="0.3em" text-anchor="middle" font-size="10" fill="%239ca3af">请检查路径</text></svg>';
                        }
                        }}
                    />
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-3xl bg-white border-4 border-white shadow-2xl overflow-hidden z-20">
                        <img src={student.avatar} className="w-full h-full object-cover" alt={student.name} />
                    </div>
                </div>
                
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-indigo-900 drop-shadow-sm">✨ 灵兽契约 ✨</h2>
                    <p className="text-indigo-300 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">1岁形象预览</p>
                </div>

                <input
                    type="text"
                    placeholder="赋予它一个充满魔力的名字..."
                    className="w-full px-6 py-5 bg-white border-4 border-indigo-100 focus:border-indigo-400 rounded-3xl focus:outline-none font-black text-center shadow-md text-xl placeholder:text-gray-200"
                    value={adoptionName}
                    onChange={(e) => setAdoptionName(e.target.value)}
                    />
                </div>

                <div className="w-full space-y-4">
                <button
                    disabled={!adoptionName.trim()}
                    onClick={handleConfirmAdopt}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-5 rounded-[2.5rem] font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    降临，伙伴！🌟
                </button>
                <button onClick={onBack} className="w-full text-gray-300 text-sm font-black hover:text-indigo-400 transition py-2 text-center">
                    先回去乐园看看
                </button>
                </div>
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-10 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-200 text-center space-y-4 min-h-[30rem]">
                     <div className="text-6xl grayscale opacity-50">📦</div>
                     <h3 className="text-xl font-black text-gray-400">资源库为空</h3>
                     <p className="text-sm text-gray-400 font-bold px-4">老师尚未上传任何宠物形象资源包。<br/>请联系老师在“教师管理”中导入图片。</p>
                     <button onClick={onBack} className="mt-4 text-indigo-400 font-black underline">返回</button>
                </div>
            )}
          </div>

          <div className="lg:w-3/5 space-y-8">
            <div className="bg-indigo-50 px-6 py-4 rounded-3xl border-2 border-indigo-100">
              <h3 className="font-black text-indigo-900 text-lg flex items-center gap-2">
                <span>🌈</span> 请选择你的守护伙伴
              </h3>
              <p className="text-xs text-indigo-400 mt-1 font-bold">仅显示班级专属上传的珍稀物种</p>
            </div>

            <div className="min-h-[32rem]">
                {allPetOptions.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-h-[34rem] overflow-y-auto pr-4 custom-scrollbar p-2">
                    {allPetOptions.map((animal) => {
                        return (
                        <button
                            key={animal.id}
                            onClick={() => setSelectedPet(animal)}
                            className={`group relative aspect-square rounded-[2rem] overflow-hidden border-4 transition-all hover:scale-105 ${selectedPet?.id === animal.id ? 'border-indigo-500 shadow-2xl scale-105 z-10' : 'border-white opacity-80 hover:opacity-100 shadow-lg'}`}
                        >
                            <img 
                            src={animal.urls[0]} 
                            className="w-full h-full object-cover" 
                            alt={animal.name}
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-black py-3 px-2 translate-y-full group-hover:translate-y-0 transition-transform">
                            {animal.name}
                            </div>
                        </button>
                        );
                    })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[30rem] text-indigo-200 font-black text-lg italic border-4 border-dashed border-indigo-50 rounded-[3rem]">
                        Waiting for upload...
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isMaxStage = pet.stage === 9 && pet.progress === 100;

  const handleBuyFood = () => {
    if (pet.points >= 1) {
      onUpdatePet(p => {
        const newLog: PointLog = {
          id: Date.now().toString(),
          amount: -1,
          reason: '购买能量餐包',
          timestamp: new Date().toLocaleString()
        };
        return {
          ...p,
          points: p.points - 1,
          food: p.food + 1,
          logs: [newLog, ...p.logs].slice(0, 50)
        };
      });
    }
  };

  const handleFeed = () => {
    onUpdatePet(p => {
      let newProgress = p.progress;
      let newStage = p.stage;
      let newFood = p.food;
      let newPoints = p.points;
      const newLogs = [...p.logs];

      if (newFood > 0 && newPoints > 0) {
        newFood -= 1;
        newPoints -= 1;
        newProgress += 20; 
        
        newLogs.unshift({
          id: Date.now().toString(),
          amount: -1,
          reason: '喂食成功 (消耗餐包+魔法)',
          timestamp: new Date().toLocaleString()
        });

        if (newProgress >= 100) {
          if (newStage < 9) {
            newStage += 1;
            newProgress = 0;
            newLogs.unshift({
              id: `LV-${Date.now()}`,
              amount: 0,
              reason: `🎊 升级！当前年龄：${newStage + 1}岁`,
              timestamp: new Date().toLocaleString()
            });
          } else {
            newProgress = 100;
          }
        }
      } else if (newFood <= 0) {
        newProgress = Math.max(0, newProgress - 10);
        newLogs.unshift({
          id: Date.now().toString(),
          amount: 0,
          reason: '饥饿预警，成长值受损',
          timestamp: new Date().toLocaleString()
        });
      } else if (newPoints <= 0) {
        newLogs.unshift({
          id: Date.now().toString(),
          amount: 0,
          reason: '魔法能量枯竭，无法进行生命转化',
          timestamp: new Date().toLocaleString()
        });
      }
      
      return { 
        ...p, 
        progress: newProgress, 
        stage: newStage, 
        food: newFood, 
        points: newPoints,
        logs: newLogs.slice(0, 50)
      };
    });
  };

  return (
    <div className="space-y-10 pb-16">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="group flex items-center bg-white px-6 py-3 rounded-2xl font-black text-indigo-500 hover:text-indigo-700 shadow-md border-2 border-indigo-50 transition-all active:scale-95">
          <ICONS.Home className="mr-3 w-6 h-6" /> 返回乐园
        </button>
        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-[1.5rem] font-black text-indigo-900 shadow-xl border-4 border-white flex items-center gap-4">
          <div className="w-8 h-8 rounded-xl border-2 border-indigo-100 overflow-hidden shadow-sm">
            <img src={student.avatar} className="w-full h-full object-cover" alt="" />
          </div>
          <span className="text-sm tracking-wide">{student.name} 的宝贝档案</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="cute-card bg-white p-12 text-center relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 left-0 w-full h-5 bg-gray-50/50 overflow-hidden">
               <div className="h-full bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 animate-pulse transition-all duration-1000" style={{width: `${(pet.stage + 1) * 10}%`}}></div>
            </div>
            
            <div className="mb-12 w-full pt-4">
              <h2 className="text-6xl font-black text-indigo-950 mb-3 drop-shadow-sm tracking-tighter">"{pet.name}"</h2>
              <div className="flex justify-center items-center gap-4">
                  <span className="bg-indigo-600 text-white px-8 py-2 rounded-full text-[14px] font-black uppercase tracking-[0.3em] shadow-2xl border-2 border-indigo-400">
                    {pet.stage + 1} 岁
                  </span>
                  <span className="text-indigo-200 font-black text-[10px] uppercase tracking-widest italic">Asset Stage {pet.stage + 1} Active</span>
              </div>
            </div>

            <div className="relative mb-16">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-indigo-200 to-blue-200 blur-[130px] rounded-full scale-[2] opacity-40 pet-bounce"></div>
              
              <div className="relative z-10 pet-bounce">
                  <img 
                    src={pet.customImages[pet.stage]} 
                    alt={`Current Stage ${pet.stage + 1}`} 
                    className="w-96 h-96 md:w-[35rem] md:h-[35rem] mx-auto object-cover rounded-[6rem] shadow-[0_50px_100px_-30px_rgba(79,70,229,0.4)] border-[14px] border-white bg-white hover:scale-[1.03] transition-transform duration-1000"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23f0f0f0"/><text y="50%" x="50%" dy="0.3em" text-anchor="middle" font-size="20" fill="%23999">图片缺失</text></svg>';
                    }}
                  />
              </div>
            </div>

            <div className="w-full max-w-2xl px-4">
              <div className="flex justify-between items-end text-indigo-900 font-black mb-5 px-4">
                <span className="flex items-center gap-4 text-3xl">🌱 生命成长值</span>
                <span className="bg-white px-6 py-2 rounded-3xl text-xl shadow-inner border-2 border-indigo-50">{pet.progress}%</span>
              </div>
              <div className="w-full bg-indigo-50/20 h-16 rounded-[2.5rem] overflow-hidden border-[8px] border-white shadow-2xl p-1.5">
                <div 
                  className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 h-full rounded-full transition-all duration-1000 relative"
                  style={{ width: `${pet.progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-xl"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="cute-card bg-white p-10 border-indigo-50/50 shadow-xl">
             <h3 className="font-black text-indigo-900 text-2xl mb-10 flex items-center gap-5 border-b-2 border-dashed border-indigo-50 pb-5">
               <span className="text-3xl">📜</span> 成长编年史
             </h3>
             <div className="space-y-6 max-h-[25rem] overflow-y-auto pr-4 custom-scrollbar">
                {pet.logs.length === 0 ? (
                  <p className="text-center py-20 text-indigo-200 font-black text-xl italic">Waiting for evolution stories...</p>
                ) : (
                  pet.logs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-6 rounded-[2.5rem] bg-indigo-50/20 border-2 border-white group hover:bg-white hover:shadow-2xl transition-all duration-500">
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl ${log.amount > 0 ? 'bg-green-100 text-green-600' : log.amount < 0 ? 'bg-red-100 text-red-600' : 'bg-white text-gray-400'}`}>
                            {log.amount > 0 ? `+${log.amount}` : log.amount === 0 ? '✨' : log.amount}
                          </div>
                          <div>
                            <div className="text-xl font-black text-indigo-950 group-hover:text-indigo-600 transition-colors">{log.reason}</div>
                            <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">{log.timestamp}</div>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="cute-card bg-white p-10 border-yellow-50/50 shadow-xl">
            <h3 className="font-black text-indigo-900 text-2xl mb-10 border-b-4 border-dashed border-indigo-50/30 pb-5 flex items-center gap-4">
               <span className="text-3xl">🎒</span> 乐园背包
            </h3>
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-10 rounded-[3rem] border-4 border-white flex justify-between items-center shadow-xl group hover:scale-[1.03] transition-transform">
                <div>
                  <span className="text-[11px] font-black text-orange-400 block mb-3 tracking-[0.3em] uppercase">✨ 魔法积分</span>
                  <div className="text-6xl font-black text-orange-600 tabular-nums">{pet.points}</div>
                </div>
                <div className="text-7xl group-hover:rotate-12 transition-transform">⭐</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-10 rounded-[3rem] border-4 border-white flex justify-between items-center shadow-xl group hover:scale-[1.03] transition-transform">
                <div>
                  <span className="text-[11px] font-black text-green-400 block mb-3 tracking-[0.3em] uppercase">🍔 能量餐包</span>
                  <div className="text-6xl font-black text-emerald-600 tabular-nums">{pet.food}</div>
                </div>
                <div className="text-7xl group-hover:rotate-12 transition-transform">🍎</div>
              </div>
            </div>
          </div>

          <div className="cute-card bg-white p-10 border-indigo-50/50 space-y-6 shadow-2xl">
            <button
              onClick={handleBuyFood}
              disabled={pet.points < 1}
              className="w-full py-6 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all disabled:opacity-40 active:scale-95"
            >
              🛒 兑换餐包 (1分)
            </button>
            <button
              onClick={handleFeed}
              className="w-full py-8 bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-[3rem] font-black text-4xl shadow-2xl transition-all flex items-center justify-center gap-5 active:scale-95 transform hover:-translate-y-2"
            >
              🥄 启动喂养！
            </button>
          </div>

          {isMaxStage && (
            <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-indigo-700 p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 opacity-20 text-9xl rotate-12 transition-all duration-1000 group-hover:rotate-[30deg] group-hover:scale-125">🏆</div>
               <h3 className="font-black text-4xl mb-5 drop-shadow-lg">进化顶点！</h3>
               <p className="text-lg font-bold opacity-90 mb-10 leading-relaxed">不可思议，你的伙伴已经达到了10岁终极形态。快去生成见证这一时刻的奇迹海报吧！</p>
               <button 
                 onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                 className="w-full bg-white text-indigo-700 py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all"
               >
                 荣誉档案 📜
               </button>
            </div>
          )}
        </div>
      </div>

      {isMaxStage && (
        <div className="mt-32 pt-32 border-t-8 border-dotted border-indigo-100 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-10 rounded-[3.5rem] border-8 border-indigo-100 shadow-2xl pet-bounce">
              <ICONS.Trophy className="w-20 h-20 text-indigo-600" />
          </div>
          <Poster student={student} pet={pet} />
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
