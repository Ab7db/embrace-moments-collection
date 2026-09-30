import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { countries, type Country } from "@/data/countries";
import { useLang, pick } from "@/lib/i18n";
import { useMounted, useReducedMotion } from "@/hooks/useMotionPrefs";

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const R = 2; // Globe radius (scene units)
const AMBER = "#c49a45";
const AMBER_HI = "#e8b84b";
const CAM_DIST_DEFAULT = 5.5;

/* ══════════════════════════════════════════
   COORDINATE MATH
   φ = (90 - lat) × (π/180)
   θ = (lon + 180) × (π/180)
══════════════════════════════════════════ */
function latLonToVec3(lat: number, lon: number, radius = R): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/* ══════════════════════════════════════════
   GLOBE SPHERE
   Dark base + wireframe lat/lon overlay
══════════════════════════════════════════ */
function GlobeSphere() {
  return (
    <>
      {/* Base */}
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshPhongMaterial
          color="#0b0b0b"
          emissive="#070707"
          specular="#1e1e1e"
          shininess={20}
        />
      </mesh>

      {/* Wireframe lat/lon lines */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[R + 0.003, 28, 14]} />
        <meshBasicMaterial
          color="#1e1e1e"
          wireframe
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* ══════════════════════════════════════════
   ATMOSPHERIC GLOW (Fresnel / Rim Light)
══════════════════════════════════════════ */
function Atmosphere() {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const breathe = Math.sin(t * 0.7) * 0.012;
    if (innerRef.current)
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.055 + breathe;
    if (outerRef.current)
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.032 + breathe * 0.5;
  });

  return (
    <>
      {/* Inner rim */}
      <mesh ref={innerRef} renderOrder={2}>
        <sphereGeometry args={[R + 0.04, 64, 64]} />
        <meshBasicMaterial
          color={AMBER}
          transparent
          opacity={0.055}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Outer halo */}
      <mesh ref={outerRef} renderOrder={3}>
        <sphereGeometry args={[R + 0.22, 64, 64]} />
        <meshBasicMaterial
          color={AMBER}
          transparent
          opacity={0.032}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* ══════════════════════════════════════════
   COUNTRY MARKER
   Pulsing amber beacon + beam + tooltip
══════════════════════════════════════════ */
function CountryMarker({
  country,
  onHover,
  onClick,
  isSelected,
  phaseOffset = 0,
}: {
  country: Country;
  onHover: (c: Country | null) => void;
  onClick: (c: Country) => void;
  isSelected: boolean;
  phaseOffset?: number;
}) {
  const { lang } = useLang();
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const dot = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isFacing, setIsFacing] = useState(true);
  const active = hovered || isSelected;

  /* Surface position & outward quaternion */
  const position = useMemo(() => latLonToVec3(country.lat, country.lon), [country]);
  const quaternion = useMemo(() => {
    const normal = position.clone().normalize();
    return new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normal,
    );
  }, [position]);

  const col = active ? AMBER_HI : AMBER;
  const beamH = active ? 0.35 : 0.18;

  /* Pulsing animation + Camera facing calculation */
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime + phaseOffset;
    const p1 = (Math.sin(t * 2.3) + 1) * 0.5; // 0..1
    const p2 = (Math.sin(t * 2.3 - 1.1) + 1) * 0.5;

    if (ring1.current) {
      ring1.current.scale.setScalar(1 + p1 * 1.2);
      (ring1.current.material as THREE.MeshBasicMaterial).opacity =
        0.95 - p1 * 0.9;
    }
    if (ring2.current) {
      ring2.current.scale.setScalar(1 + p2 * 2.2);
      (ring2.current.material as THREE.MeshBasicMaterial).opacity =
        0.55 - p2 * 0.55;
    }
    if (beam.current)
      (beam.current.material as THREE.MeshBasicMaterial).opacity =
        0.2 + p1 * 0.4;
    if (dot.current)
      dot.current.scale.setScalar(active ? 1.4 : 1 + p1 * 0.15);

    // Calculate facing dot product with camera
    const markerNormal = position.clone().normalize();
    const camDir = camera.position.clone().normalize();
    const dotFacing = markerNormal.dot(camDir);
    const facing = dotFacing > 0.08;
    if (facing !== isFacing) {
      setIsFacing(facing);
    }
  });

  /* Pointer handlers */
  const onOver = useCallback(
    (e: ThreeEvent<PointerEvent> | React.MouseEvent) => {
      e.stopPropagation();
      setHovered(true);
      onHover(country);
      document.body.style.cursor = "pointer";
    },
    [country, onHover],
  );
  const onOut = useCallback(() => {
    setHovered(false);
    onHover(null);
    document.body.style.cursor = "";
  }, [onHover]);
  const onClk = useCallback(
    (e: ThreeEvent<MouseEvent> | React.MouseEvent) => {
      e.stopPropagation();
      onClick(country);
    },
    [country, onClick],
  );

  const cityName = pick(lang, country.cityEn, country.cityAr);
  const countryName = pick(lang, country.nameEn, country.nameAr);

  return (
    <group position={position} quaternion={quaternion}>
      {/* Vertical light beam */}
      <mesh ref={beam} position={[0, beamH / 2, 0]}>
        <cylinderGeometry args={[0.004, 0.0005, beamH, 6]} />
        <meshBasicMaterial color={col} transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Pin sphere — interactive hit target */}
      <mesh
        ref={dot}
        position={[0, beamH, 0]}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClk}
      >
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial color={col} />
      </mesh>

      {/* Inner pulsing ring */}
      <mesh ref={ring1} renderOrder={5}>
        <torusGeometry args={[0.058, 0.007, 8, 32]} />
        <meshBasicMaterial color={col} transparent opacity={0.95} depthWrite={false} />
      </mesh>

      {/* Outer pulse ring */}
      <mesh ref={ring2} renderOrder={5}>
        <torusGeometry args={[0.095, 0.004, 8, 32]} />
        <meshBasicMaterial color={col} transparent opacity={0.45} depthWrite={false} />
      </mesh>

      {/* Permanent clean floating City Name Label */}
      {isFacing && (
        <Html
          position={[0, beamH + 0.1, 0]}
          center
          distanceFactor={6.8}
          zIndexRange={active ? [120, 200] : [60, 100]}
          style={{
            pointerEvents: "auto",
            userSelect: "none",
          }}
        >
          <div
            onClick={onClk}
            onMouseEnter={onOver}
            onMouseLeave={onOut}
            className={`cursor-pointer group flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-md ${
              active
                ? "border-amber-400 bg-black/90 text-amber-300 ring-1 ring-amber-400/60 scale-105"
                : "border-amber-500/40 bg-black/75 text-foreground/90 hover:border-amber-400 hover:text-amber-300"
            }`}
            style={{
              boxShadow: active
                ? "0 4px 18px rgba(0,0,0,0.85), 0 0 12px rgba(232,184,75,0.4)"
                : "0 2px 10px rgba(0,0,0,0.65), 0 0 6px rgba(196,154,69,0.25)",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                backgroundColor: active ? AMBER_HI : AMBER,
                boxShadow: `0 0 6px ${active ? AMBER_HI : AMBER}`,
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              {cityName}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ══════════════════════════════════════════
   SCENE  (inside Canvas)
══════════════════════════════════════════ */
function GlobeScene({
  selectedCountry,
  onCountrySelect,
  countries: propCountries,
}: {
  selectedCountry?: any;
  onCountrySelect?: ((c: any) => void) | undefined;
  countries?: any[] | undefined;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const reduced = useReducedMotion();

  const normalizedCountries: Country[] = useMemo(() => {
    if (propCountries && propCountries.length > 0) {
      return propCountries.map((c: any) => ({
        id: c.id,
        nameEn: c.name_en || c.nameEn || "Country",
        nameAr: c.name_ar || c.nameAr || "دولة",
        cityEn: c.city_en || c.cityEn || "City",
        cityAr: c.city_ar || c.cityAr || "مدينة",
        lat: typeof c.lat === "number" ? c.lat : parseFloat(c.lat) || 0,
        lon: typeof c.lon === "number" ? c.lon : parseFloat(c.lon) || 0,
        cover: c.cover_url || c.cover || "",
        photoCount: c.photo_count || c.photoCount || 0,
        campaignCount: c.campaign_count || c.campaignCount || 0,
        tagsEn: c.tags_en || c.tagsEn || [],
        tagsAr: c.tags_ar || c.tagsAr || [],
      }));
    }
    return countries;
  }, [propCountries]);

  /* Initial camera position */
  useEffect(() => {
    camera.position.set(0, 1.2, CAM_DIST_DEFAULT);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  /* Click → GSAP camera pan */
  const handleClick = useCallback(
    (country: Country) => {
      const isAlreadySelected = selectedCountry?.id === country.id;
      const ctrl = controlsRef.current;

      if (isAlreadySelected) {
        /* Deselect — zoom back out */
        gsap.to(camera.position, {
          x: 0, y: 1.2, z: CAM_DIST_DEFAULT,
          duration: 1.4, ease: "power2.inOut",
          onUpdate: () => ctrl?.update?.(),
        });
        if (onCountrySelect) onCountrySelect(null);
        return;
      }

      /* Face the selected country */
      const surfacePos = latLonToVec3(country.lat, country.lon);
      const dir = surfacePos.clone().normalize();
      const newPos = dir.multiplyScalar(4.0);

      if (ctrl) ctrl.enabled = false;
      gsap.to(camera.position, {
        x: newPos.x, y: newPos.y, z: newPos.z,
        duration: 1.7, ease: "power2.inOut",
        onUpdate: () => ctrl?.update?.(),
        onComplete: () => { if (ctrl) ctrl.enabled = true; },
      });

      if (onCountrySelect) onCountrySelect(country);
    },
    [camera, selectedCountry, onCountrySelect],
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.22} />
      <directionalLight position={[5, 4, 5]} intensity={0.95} color="#ffffff" />
      <directionalLight position={[-4, -2, -4]} intensity={0.28} color={AMBER} />
      <pointLight position={[9, 9, 9]} intensity={0.45} color={AMBER} decay={2} />

      {/* Star field */}
      <Stars radius={65} depth={60} count={2800} factor={4} saturation={0} fade speed={0.25} />

      {/* Globe */}
      <GlobeSphere />
      <Atmosphere />

      {/* Country markers */}
      {normalizedCountries.map((c, i) => (
        <CountryMarker
          key={c.id}
          country={c}
          onHover={() => {}}
          onClick={handleClick}
          isSelected={selectedCountry?.id === c.id}
          phaseOffset={i * 1.35}
        />
      ))}

      {/* Orbit Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom
        minDistance={3.2}
        maxDistance={7.5}
        autoRotate={!reduced && !selectedCountry}
        autoRotateSpeed={0.38}
        enableDamping
        dampingFactor={0.055}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
      />
    </>
  );
}

/* ══════════════════════════════════════════
   PUBLIC API
══════════════════════════════════════════ */
export interface GlobeProps {
  selectedCountry?: any;
  onCountrySelect?: (c: any) => void;
  onSelectCountry?: (c: any) => void;
  countries?: any[];
  height?: string;
}

export function Globe({
  selectedCountry,
  onCountrySelect,
  onSelectCountry,
  countries: propCountries,
  height = "clamp(420px, 68vh, 720px)",
}: GlobeProps) {
  const mounted = useMounted();
  if (!mounted) return null;

  const handleSelect = onCountrySelect || onSelectCountry;

  return (
    <div
      aria-label="Interactive 3D Globe showing photography locations"
      role="img"
      style={{ width: "100%", height, position: "relative" }}
    >
      {/* Vignette overlay (corners) */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
          background: "radial-gradient(ellipse at center, transparent 55%, oklch(0.145 0 0 / 0.65) 100%)",
        }}
      />

      <Canvas
        camera={{ position: [0, 1.2, CAM_DIST_DEFAULT], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", touchAction: "none" }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <GlobeScene
            selectedCountry={selectedCountry}
            onCountrySelect={handleSelect}
            countries={propCountries}
          />
        </Suspense>
      </Canvas>

      {/* Tap hint */}
      <p
        aria-hidden
        style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
          color: "oklch(0.7 0.004 85 / 0.45)", fontFamily: "Manrope,sans-serif",
          pointerEvents: "none", whiteSpace: "nowrap", zIndex: 20,
        }}
      >
        {selectedCountry ? "click marker again to deselect" : "drag · scroll · click marker"}
      </p>
    </div>
  );
}
