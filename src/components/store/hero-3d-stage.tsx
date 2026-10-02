"use client";

import * as React from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type ProductView = "both" | "duo" | "pro";

interface Hero3DStageProps {
  activeView: ProductView;
  isPaused: boolean;
  onViewChange?: (view: ProductView) => void;
  className?: string;
}

interface ModelTransform {
  x: number;
  y: number;
  z: number;
  ry: number;
  rz: number;
  scale: number;
  visible: boolean;
}

export function Hero3DStage({
  activeView,
  isPaused,
  className = "",
}: Hero3DStageProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [stageState, setStageState] = React.useState<
    "loading" | "ready" | "error"
  >("loading");
  const [retryKey, setRetryKey] = React.useState(0);

  // References across animation ticks
  const stateRef = React.useRef({
    scene: null as THREE.Scene | null,
    renderer: null as THREE.WebGLRenderer | null,
    camera: null as THREE.OrthographicCamera | null,
    environment: null as THREE.Texture | null,
    models: new Map<string, THREE.Group>(),
    current: new Map<string, ModelTransform>(),
    target: new Map<string, ModelTransform>(),
    frameId: 0,
    previousTime: 0,
    elapsed: 0,
    disposed: false,
    inView: true,
    isPaused: false,
    activeView: "both" as ProductView,
  });

  stateRef.current.isPaused = isPaused;
  stateRef.current.activeView = activeView;

  // Helper to compute target transforms based on active view
  const updateTargets = React.useCallback((view: ProductView) => {
    const together = view === "both";
    stateRef.current.target.set("duo", {
      x: together ? -0.72 : 0,
      y: together ? 0.08 : 0,
      z: 0,
      ry: -0.28,
      rz: 0.065,
      scale: together ? 1 : 1.13,
      visible: together || view === "duo",
    });

    stateRef.current.target.set("pro", {
      x: together ? 1.45 : 0,
      y: together ? -0.12 : 0,
      z: together ? 1.8 : 0,
      ry: Math.PI - 0.35,
      rz: together ? -0.14 : -0.06,
      scale: together ? 0.88 : 1.04,
      visible: together || view === "pro",
    });
  }, []);

  // Update target when activeView prop changes
  React.useEffect(() => {
    updateTargets(activeView);
    if (stateRef.current.isPaused) {
      // Snap instantly if paused
      stateRef.current.models.forEach((model, key) => {
        const t = stateRef.current.target.get(key);
        if (!t) return;
        stateRef.current.current.set(key, { ...t });
        model.visible = t.visible;
        model.position.set(t.x, t.y, t.z);
        model.rotation.set(-0.055, t.ry, t.rz);
        model.scale.setScalar(t.scale);
      });
      const { renderer, scene, camera } = stateRef.current;
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
  }, [activeView, updateTargets]);

  // Main Three.js setup and load effect
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const stage = containerRef.current;
    if (!canvas || !stage) return;

    let disposed = false;
    stateRef.current.disposed = false;
    setStageState("loading");

    // Initialize targets
    updateTargets(activeView);

    // Renderer setup
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      setStageState("error");
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-3, 3, 2.5, -2.5, 0.1, 100);
    camera.position.set(0, 0, 14);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xece9ff, 0x24213d, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(-3, 5, 8);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xc7bcff, 2);
    rimLight.position.set(6, 1, -2);
    scene.add(rimLight);

    stateRef.current.scene = scene;
    stateRef.current.renderer = renderer;
    stateRef.current.camera = camera;
    stateRef.current.environment = environment.texture;

    const resize = () => {
      if (!renderer || disposed || !stage) return;
      const { width, height } = stage.getBoundingClientRect();
      if (!width || !height) return;
      const aspect = width / height;
      const viewHeight = Math.max(4.4, 6.2 / aspect);
      camera.left = (-viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, window.innerWidth <= 700 ? 1.25 : 1.5)
      );
      renderer.setSize(width, height, false);
      if (stateRef.current.isPaused) {
        renderer.render(scene, camera);
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    // Animation loop
    const tick = (time: number) => {
      stateRef.current.frameId = 0;
      if (disposed || stateRef.current.disposed) return;

      if (stateRef.current.isPaused || !stateRef.current.inView) {
        return;
      }

      const prev = stateRef.current.previousTime;
      const delta = prev ? Math.min((time - prev) / 1000, 0.1) : 0;
      if (prev && delta < 1 / 32) {
        stateRef.current.frameId = requestAnimationFrame(tick);
        return;
      }

      stateRef.current.previousTime = time;
      stateRef.current.elapsed += delta;
      const lerp = 1 - Math.exp(-delta * 5);

      stateRef.current.models.forEach((model, key) => {
        const t = stateRef.current.target.get(key);
        if (!t) return;
        const c = stateRef.current.current.get(key) || { ...t };

        c.x = THREE.MathUtils.lerp(c.x, t.x, lerp);
        c.y = THREE.MathUtils.lerp(c.y, t.y, lerp);
        c.z = THREE.MathUtils.lerp(c.z, t.z, lerp);
        c.ry = THREE.MathUtils.lerp(c.ry, t.ry, lerp);
        c.rz = THREE.MathUtils.lerp(c.rz, t.rz, lerp);
        c.scale = THREE.MathUtils.lerp(c.scale, t.scale, lerp);
        stateRef.current.current.set(key, c);

        model.visible = t.visible;
        const phase = key === "duo" ? 0 : 1.8;
        model.position.set(
          c.x,
          c.y + Math.sin(stateRef.current.elapsed * 0.55 + phase) * 0.048,
          c.z
        );
        model.rotation.set(
          -0.055 + Math.sin(stateRef.current.elapsed * 0.35 + phase) * 0.018,
          c.ry + Math.sin(stateRef.current.elapsed * 0.32 + phase) * 0.025,
          c.rz
        );
        model.scale.setScalar(c.scale);
      });

      renderer.render(scene, camera);
      stateRef.current.frameId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!stateRef.current.frameId && !disposed && !stateRef.current.isPaused) {
        stateRef.current.frameId = requestAnimationFrame(tick);
      }
    };

    // Load Model helper
    const loadModel = async (
      key: "duo" | "pro",
      url: string,
      targetHeight: number
    ) => {
      const loader = new GLTFLoader();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      loader.setMeshoptDecoder(MeshoptDecoder as any);
      const gltf = await loader.loadAsync(url);
      const loaded = gltf.scene;

      if (key === "duo") {
        // Remove AR occlusion/helper surfaces
        const helpers = [
          "PXwNjghIIgDPXsa",
          "iKZSoAlRlDlkSEw",
          "uWPCbpPKzwJOmUY",
          "RwQzmCvUWHGlFfV",
          "SCDZMtVjLrcxENj",
          "mjecbCFnfurWWJV",
          "lJPfQMFXvvcmdtA",
        ];
        for (const name of helpers) {
          loaded.getObjectByName(name)?.removeFromParent();
        }

        // Authored violet wallpaper shader material for display geometry
        loaded.traverse((object) => {
          if (
            !(object instanceof THREE.Mesh) ||
            ![
              "JnJdTkxbQgUtLwU",
              "UXtsBZYlaUvHoEh",
              "xpVpaKuQKnXQhFj",
              "svvOILdVxasRAOk",
            ].includes(object.name)
          ) {
            return;
          }

          object.geometry = object.geometry.clone();
          object.geometry.computeBoundingBox();
          const bounds = object.geometry.boundingBox;
          if (!bounds) return;

          const extent = bounds.getSize(new THREE.Vector3());
          const vertical = extent.y > extent.z ? "y" : "z";
          const positions = object.geometry.getAttribute("position");
          const uv = new Float32Array(positions.count * 2);
          for (let i = 0; i < positions.count; i++) {
            uv[i * 2] =
              (positions.getX(i) - bounds.min.x) / Math.max(extent.x, 0.00001);
            uv[i * 2 + 1] =
              ((vertical === "y" ? positions.getY(i) : positions.getZ(i)) -
                bounds.min[vertical]) /
              Math.max(extent[vertical], 0.00001);
          }
          object.geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
          object.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
              offset: {
                value: [
                  "xpVpaKuQKnXQhFj",
                  "svvOILdVxasRAOk",
                ].includes(object.name)
                  ? 0
                  : 0.5,
              },
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              varying vec2 vUv;
              uniform float offset;
              void main() {
                vec2 p = vec2(vUv.x * 0.5 + offset, vUv.y);
                float arc = length((p - vec2(0.72, 1.15)) * vec2(1.1, 0.9));
                float band = pow(0.5 + 0.5 * sin(arc * 14.0 - 1.0), 2.0);
                vec3 violet = mix(vec3(0.025, 0.015, 0.08), vec3(0.35, 0.17, 0.68), band);
                float rim = exp(-pow((arc - 0.62) * 24.0, 2.0));
                violet += vec3(0.26, 0.33, 0.45) * rim;
                violet *= 0.6 + 0.4 * p.y;
                gl_FragColor = vec4(violet, 1.0);
                #include <colorspace_fragment>
              }
            `,
          });
        });

        // Replicate screen outline into opened left leaf
        loaded.updateMatrixWorld(true);
        const display = loaded.getObjectByName("UXtsBZYlaUvHoEh");
        if (display instanceof THREE.Mesh) {
          const geometry = display.geometry
            .clone()
            .applyMatrix4(display.matrixWorld);
          geometry.computeBoundingBox();
          if (geometry.boundingBox) {
            const center = geometry.boundingBox.getCenter(new THREE.Vector3());
            geometry.translate(-center.x, -center.y, -center.z);
            geometry.scale(0.95, 0.96, 1);
            geometry.rotateY((-16 * Math.PI) / 180);
            geometry.translate(-0.078, 0.05885, -0.009);
            const material = display.material.clone() as THREE.ShaderMaterial;
            if (material.uniforms?.offset) {
              material.uniforms.offset.value = 0;
            }
            const screen = new THREE.Mesh(geometry, material);
            screen.name = "RestoredInnerDisplay";
            loaded.add(screen);
          }
        }
      }

      loaded.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(loaded);
      const size = box.getSize(new THREE.Vector3());
      if (box.isEmpty() || size.y <= 0) throw new Error("Empty model");

      const center = box.getCenter(new THREE.Vector3());
      const normalization = new THREE.Group();
      loaded.position.sub(center);
      normalization.add(loaded);
      normalization.scale.setScalar(targetHeight / size.y);

      const group = new THREE.Group();
      group.add(normalization);
      scene.add(group);
      stateRef.current.models.set(key, group);

      const t = stateRef.current.target.get(key);
      if (t) {
        stateRef.current.current.set(key, { ...t });
        group.visible = t.visible;
        group.position.set(t.x, t.y, t.z);
        group.rotation.set(-0.055, t.ry, t.rz);
        group.scale.setScalar(t.scale);
      }
    };

    // Load both models concurrently
    Promise.all([
      loadModel("duo", "/hero/iphone-duo.glb", 2.9),
      loadModel("pro", "/hero/iphone-18-pro.glb", 3.55),
    ])
      .then(() => {
        if (disposed) return;
        setStageState("ready");
        renderer.render(scene, camera);
        startLoop();
      })
      .catch((err) => {
        if (disposed) return;
        console.warn("Slurge 3D Stage fallback:", err);
        setStageState("error");
      });

    // Visibility / Intersection observer
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        stateRef.current.inView = entries[0]?.isIntersecting ?? true;
        if (stateRef.current.inView && !stateRef.current.isPaused) {
          startLoop();
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(stage);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      disposed = true;
      stateRef.current.disposed = true;
      cancelAnimationFrame(stateRef.current.frameId);
      setStageState("error");
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);

    return () => {
      disposed = true;
      stateRef.current.disposed = true;
      cancelAnimationFrame(stateRef.current.frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", handleContextLost);

      // Clean Three.js resources
      pmrem.dispose();
      environment.dispose();
      stateRef.current.models.forEach((group) => {
        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else if (obj.material) {
              obj.material.dispose();
            }
          }
        });
      });
      stateRef.current.models.clear();
      renderer.dispose();
    };
  }, [retryKey, updateTargets, activeView]);

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Three-dimensional flagship smartphone display floating above iridescent liquid-glass"
      className={`relative w-full h-full select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full h-full block filter drop-shadow-[0_24px_30px_rgba(0,0,0,0.5)] transition-opacity duration-700 pointer-events-none"
        style={{ opacity: stageState === "ready" ? 1 : 0 }}
      />

      {/* Loading state indicator */}
      {stageState === "loading" && (
        <div
          role="status"
          className="absolute inset-0 flex items-center justify-center gap-2.5 text-xs text-slate-300 font-medium z-10"
        >
          <span
            aria-hidden="true"
            className="w-2 h-2 rounded-full bg-indigo-400 animate-hero-loading-pulse"
          />
          <span>Preparing 3D interactive view…</span>
        </div>
      )}

      {/* Fallback image when WebGL is unavailable or errors */}
      {stageState === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero/hero-device.png"
            alt="Flagship smartphone presentation"
            className="max-h-[80%] max-w-[85%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
          />
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-3 px-4 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-xs font-semibold text-white border border-indigo-500/40 transition-colors"
          >
            Retry 3D Experience
          </button>
        </div>
      )}
    </div>
  );
}
