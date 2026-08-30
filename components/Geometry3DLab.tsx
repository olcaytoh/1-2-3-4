import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, RotateCcw, Eye, Sparkles, Layers, Box, Info } from 'lucide-react';

interface Geometry3DLabProps {
  onClose: () => void;
}

type ShapeKey = 'kup' | 'kure' | 'silindir' | 'dikdortgen_prizma' | 'kare_prizma' | 'ucgen_prizma';

interface ShapeMeta {
  name: string;
  faces: number;
  edges: number;
  vertices: number;
  description: string;
}

const SHAPE_DATA: Record<ShapeKey, ShapeMeta> = {
  kup: {
    name: 'Küp',
    faces: 6,
    edges: 12,
    vertices: 8,
    description: '6 karesel yüzü, 12 eşit ayrıtı ve 8 köşesi bulunur.'
  },
  kure: {
    name: 'Küre',
    faces: 1,
    edges: 0,
    vertices: 0,
    description: 'Eğri bir yüzeyi vardır. Köşesi ve ayrıtı yoktur.'
  },
  silindir: {
    name: 'Silindir',
    faces: 3,
    edges: 0,
    vertices: 0,
    description: '2 daire tabanı ve 1 eğri yan yüzeyi vardır. Ayrıtı ve köşesi yoktur.'
  },
  dikdortgen_prizma: {
    name: 'Dikdörtgenler Prizması',
    faces: 6,
    edges: 12,
    vertices: 8,
    description: '6 dikdörtgensel yüzü, 12 ayrıtı ve 8 köşesi vardır.'
  },
  kare_prizma: {
    name: 'Kare Prizma',
    faces: 6,
    edges: 12,
    vertices: 8,
    description: '2 karesel tabanı ve 4 dikdörtgensel yan yüzü bulunur. 12 ayrıtı, 8 köşesi vardır.'
  },
  ucgen_prizma: {
    name: 'Üçgen Prizma',
    faces: 5,
    edges: 9,
    vertices: 6,
    description: '2 üçgen tabanı ve 3 dikdörtgen yan yüzü vardır. 9 ayrıtı, 6 köşesi bulunur.'
  }
};

export const Geometry3DLab: React.FC<Geometry3DLabProps> = ({ onClose }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedShape, setSelectedShape] = useState<ShapeKey>('kup');
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [colorScheme, setColorScheme] = useState('#3B82F6');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.LineSegments | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.6);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !meshRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      meshRef.current.rotation.y += deltaX * 0.01;
      meshRef.current.rotation.x += deltaY * 0.01;

      if (wireframeMeshRef.current) {
        wireframeMeshRef.current.rotation.y += deltaX * 0.01;
        wireframeMeshRef.current.rotation.x += deltaY * 0.01;
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (autoRotate && meshRef.current && !isDragging) {
        meshRef.current.rotation.y += 0.01;
        meshRef.current.rotation.x += 0.005;
        if (wireframeMeshRef.current) {
          wireframeMeshRef.current.rotation.y += 0.01;
          wireframeMeshRef.current.rotation.x += 0.005;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Geometry when selectedShape or wireframe changes
  useEffect(() => {
    if (!sceneRef.current) return;

    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
      meshRef.current = null;
    }
    if (wireframeMeshRef.current) {
      sceneRef.current.remove(wireframeMeshRef.current);
      wireframeMeshRef.current.geometry.dispose();
      (wireframeMeshRef.current.material as THREE.Material).dispose();
      wireframeMeshRef.current = null;
    }

    let geometry: THREE.BufferGeometry;

    switch (selectedShape) {
      case 'kup':
        geometry = new THREE.BoxGeometry(2, 2, 2);
        break;
      case 'kure':
        geometry = new THREE.SphereGeometry(1.4, 32, 32);
        break;
      case 'silindir':
        geometry = new THREE.CylinderGeometry(1.2, 1.2, 2.4, 32);
        break;
      case 'dikdortgen_prizma':
        geometry = new THREE.BoxGeometry(2.6, 1.5, 1.8);
        break;
      case 'kare_prizma':
        geometry = new THREE.BoxGeometry(1.6, 2.6, 1.6);
        break;
      case 'ucgen_prizma': {
        const shape = new THREE.Shape();
        shape.moveTo(-1, -0.8);
        shape.lineTo(1, -0.8);
        shape.lineTo(0, 1);
        shape.closePath();
        const extrudeSettings = { depth: 2, bevelEnabled: false };
        geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();
        break;
      }
      default:
        geometry = new THREE.BoxGeometry(2, 2, 2);
    }

    const material = new THREE.MeshStandardMaterial({
      color: colorScheme,
      roughness: 0.25,
      metalness: 0.3,
      wireframe: wireframe
    });

    const mesh = new THREE.Mesh(geometry, material);
    sceneRef.current.add(mesh);
    meshRef.current = mesh;

    if (!wireframe) {
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const wireframeMesh = new THREE.LineSegments(edges, lineMaterial);
      sceneRef.current.add(wireframeMesh);
      wireframeMeshRef.current = wireframeMesh;
    }
  }, [selectedShape, wireframe, colorScheme]);

  const currentMeta = SHAPE_DATA[selectedShape];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-3 border-amber-400/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 border-b-2 border-amber-400/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧊</span>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-black text-amber-300 uppercase tracking-wide drop-shadow-sm">
                3D Geometrik Cisimler Laboratuvarı
              </h2>
              <p className="text-[11px] sm:text-xs text-blue-200">
                Şekilleri döndür, yüzlerini, ayrıtlarını ve köşelerini keşfet!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center border-2 border-white shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Shape Selection Bar */}
        <div className="px-3 py-2 bg-slate-950/60 border-b border-indigo-800/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(Object.keys(SHAPE_DATA) as ShapeKey[]).map((key) => {
            const isSelected = selectedShape === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedShape(key)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-2 border-white shadow-lg scale-105'
                    : 'bg-indigo-900/50 hover:bg-indigo-800/60 text-indigo-200 border border-indigo-700/50'
                }`}
              >
                <span>{key === 'kure' ? '⚽' : key === 'kup' ? '🎲' : key === 'silindir' ? '🥫' : '📦'}</span>
                <span>{SHAPE_DATA[key].name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 sm:p-5 overflow-y-auto">
          {/* 3D Canvas Stage */}
          <div className="md:col-span-2 relative min-h-[260px] sm:min-h-[340px] bg-gradient-to-b from-slate-950/90 to-indigo-950/90 rounded-2xl border-2 border-indigo-700/50 overflow-hidden flex items-center justify-center">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Quick Controls overlay on canvas */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-500/40 shadow-lg">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`text-xs font-bold px-2 py-0.5 rounded-full transition-all ${
                    autoRotate ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {autoRotate ? 'Dönüş: Açık' : 'Dönüş: Durdu'}
                </button>
                <button
                  onClick={() => setWireframe(!wireframe)}
                  className={`text-xs font-bold px-2 py-0.5 rounded-full transition-all ${
                    wireframe ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {wireframe ? 'İskelet Görünümü' : 'Katı Görünüm'}
                </button>
              </div>

              {/* Color choices */}
              <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-indigo-500/40 shadow-lg">
                {['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setColorScheme(color)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      colorScheme === color ? 'scale-125 border-white shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Properties Card */}
          <div className="flex flex-col gap-3">
            {/* Shape Title & Info */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/70 to-slate-900/80 border-2 border-indigo-500/40 shadow-md">
              <h3 className="text-lg font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <Box size={20} className="text-amber-400" />
                {currentMeta.name}
              </h3>
              <p className="text-xs text-indigo-100 mt-2 leading-relaxed">
                {currentMeta.description}
              </p>
            </div>

            {/* Metric counters: Yüz, Ayrıt, Köşe */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-blue-950/80 border border-blue-500/50 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[10px] uppercase font-bold text-blue-300">Yüz Sayısı</span>
                <span className="text-2xl font-black text-white mt-0.5">{currentMeta.faces}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[10px] uppercase font-bold text-emerald-300">Ayrıt Sayısı</span>
                <span className="text-2xl font-black text-white mt-0.5">{currentMeta.edges}</span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[10px] uppercase font-bold text-purple-300">Köşe Sayısı</span>
                <span className="text-2xl font-black text-white mt-0.5">{currentMeta.vertices}</span>
              </div>
            </div>

            {/* Friendly Tip */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-amber-200 text-xs flex items-start gap-2">
              <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span>
                Fareyle ya da parmağınla şekli tutup istediğin yöne çevirerek her köşesine yakından bakabilirsin!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
