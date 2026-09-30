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
   CONSTANTS & LUXURY PALETTE
══════════════════════════════════════════ */
const R = 2.0; // Globe radius
const AMBER = "#c49a45";
const AMBER_HI = "#f0c25a";
const AMBER_PALE = "#ffe8a3";
const CAM_DIST = 5.2; // Fixed locked camera distance (NO zoom in / zoom out)

/* ══════════════════════════════════════════
   COORDINATE MATH
══════════════════════════════════════════ */
function latLonToVec3(lat: number, lon: number, radius = R): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ══════════════════════════════════════════
   HIGH-RES REALISTIC PROCEDURAL EARTH TEXTURES
   Creates dark luxury realistic earth with continents,
   topography, specular ocean mask & glowing city lights
══════════════════════════════════════════ */
function useRealisticEarthTextures() {
  return useMemo(() => {
    const width = 2048;
    const height = 1024;

    // 1. Earth Map Canvas (Continents + Oceans + Night Lights)
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // 2. Specular Map Canvas (Oceans reflect gold, land is matte)
    const specCanvas = document.createElement("canvas");
    specCanvas.width = width;
    specCanvas.height = height;
    const specCtx = specCanvas.getContext("2d");

    // 3. Clouds Canvas
    const cloudCanvas = document.createElement("canvas");
    cloudCanvas.width = width;
    cloudCanvas.height = height;
    const cloudCtx = cloudCanvas.getContext("2d");

    if (!ctx || !specCtx || !cloudCtx) {
      return { mapTexture: null, specTexture: null, cloudTexture: null };
    }

    // A) Deep Oceanic Gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, "#03060a");
    oceanGrad.addColorStop(0.3, "#070b12");
    oceanGrad.addColorStop(0.5, "#0b1019");
    oceanGrad.addColorStop(0.7, "#070b12");
    oceanGrad.addColorStop(1, "#03060a");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // Specular: Oceans are reflective white/grey
    specCtx.fillStyle = "#222222";
    specCtx.fillRect(0, 0, width, height);

    // B) Lat/Lon Coordinate Grid
    ctx.strokeStyle = "rgba(196, 154, 69, 0.07)";
    ctx.lineWidth = 1;
    for (let lat = -80; lat <= 80; lat += 20) {
      const y = ((90 - lat) / 180) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Helper: Draw approximate landmass polygon
    const toXY = (lat: number, lon: number): [number, number] => [
      ((lon + 180) / 360) * width,
      ((90 - lat) / 180) * height,
    ];

    const drawPoly = (
      points: [number, number][],
      fillColor: string,
      strokeColor: string
    ) => {
      const first = points[0];
      if (!first) return;
      ctx.beginPath();
      const [startLat, startLon] = first;
      const [startX, startY] = toXY(startLat, startLon);
      ctx.moveTo(startX, startY);
      for (let i = 1; i < points.length; i++) {
        const pt = points[i];
        if (!pt) continue;
        const [lat, lon] = pt;
        const [x, y] = toXY(lat, lon);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // In specular map, land is non-reflective dark
      specCtx.beginPath();
      specCtx.moveTo(startX, startY);
      for (let i = 1; i < points.length; i++) {
        const pt = points[i];
        if (!pt) continue;
        const [lat, lon] = pt;
        const [x, y] = toXY(lat, lon);
        specCtx.lineTo(x, y);
      }
      specCtx.closePath();
      specCtx.fillStyle = "#000000";
      specCtx.fill();
    };

    const landFill = "#151921";
    const landBorder = "rgba(196, 154, 69, 0.45)";

    // Arabian Peninsula & Middle East (Focal region)
    drawPoly(
      [
        [32, 35],
        [30, 48],
        [25, 56],
        [22, 59],
        [16, 54],
        [12, 45],
        [12, 43],
        [16, 42],
        [28, 34],
        [32, 35],
      ],
      "#1a202a",
      "rgba(240, 194, 90, 0.75)"
    );

    // Africa
    drawPoly(
      [
        [36, -5],
        [37, 10],
        [32, 32],
        [15, 40],
        [11, 51],
        [-11, 40],
        [-34, 20],
        [-34, 18],
        [-15, 12],
        [5, 9],
        [5, -2],
        [12, -16],
        [28, -13],
        [36, -5],
      ],
      landFill,
      landBorder
    );

    // Europe
    drawPoly(
      [
        [36, -9],
        [43, -9],
        [48, -4],
        [58, 5],
        [71, 28],
        [68, 50],
        [55, 60],
        [45, 40],
        [36, 28],
        [36, -9],
      ],
      landFill,
      landBorder
    );

    // Asia & India
    drawPoly(
      [
        [42, 40],
        [55, 60],
        [70, 75],
        [72, 140],
        [60, 160],
        [40, 145],
        [25, 120],
        [8, 105],
        [8, 77],
        [25, 68],
        [30, 60],
        [42, 40],
      ],
      landFill,
      landBorder
    );

    // North America
    drawPoly(
      [
        [15, -92],
        [20, -105],
        [30, -115],
        [48, -125],
        [60, -140],
        [70, -160],
        [72, -95],
        [60, -65],
        [45, -60],
        [30, -80],
        [25, -80],
        [18, -90],
      ],
      landFill,
      landBorder
    );

    // South America
    drawPoly(
      [
        [12, -75],
        [5, -52],
        [-10, -36],
        [-23, -43],
        [-54, -68],
        [-40, -73],
        [-15, -75],
        [-5, -81],
        [8, -78],
      ],
      landFill,
      landBorder
    );

    // Australia
    drawPoly(
      [
        [-12, 130],
        [-15, 145],
        [-25, 153],
        [-38, 145],
        [-35, 115],
        [-22, 114],
        [-12, 130],
      ],
      landFill,
      landBorder
    );

    // C) Realistic Glowing City Lights (Golden night constellations)
    const cities: [number, number, number][] = [
      // Sana'a & Yemen
      [15.36, 44.19, 6],
      [14.5, 44.4, 4],
      [12.8, 45.0, 5],
      // Riyadh & Saudi
      [24.71, 46.67, 8],
      [21.5, 39.2, 7],
      [26.4, 50.1, 6],
      // Dubai & UAE
      [25.2, 55.27, 8],
      [24.4, 54.3, 6],
      // Cairo & Egypt
      [30.04, 31.24, 8],
      [31.2, 29.9, 6],
      // Netherlands / Europe
      [52.36, 4.9, 7],
      [52.74, 6.08, 5],
      [48.85, 2.35, 8],
      [51.5, -0.12, 8],
      [41.9, 12.5, 7],
      // Global hubs
      [40.71, -74.0, 9],
      [34.05, -118.25, 8],
      [35.68, 139.75, 9],
      [22.3, 114.17, 8],
      [1.35, 103.82, 8],
    ];

    cities.forEach(([lat, lon, rad]) => {
      const [cx, cy] = toXY(lat, lon);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad * 3.5);
      glow.addColorStop(0, AMBER_PALE);
      glow.addColorStop(0.3, AMBER_HI);
      glow.addColorStop(0.7, "rgba(196, 154, 69, 0.35)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, rad * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Center bright photon
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, rad * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // D) Clouds Canvas
    cloudCtx.fillStyle = "rgba(0,0,0,0)";
    cloudCtx.fillRect(0, 0, width, height);

    for (let i = 0; i < 45; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const rx = 80 + Math.random() * 160;
      const ry = 30 + Math.random() * 60;
      const cloudGrad = cloudCtx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        Math.max(rx, ry)
      );
      cloudGrad.addColorStop(0, "rgba(255, 255, 255, 0.18)");
      cloudGrad.addColorStop(0.6, "rgba(230, 240, 255, 0.07)");
      cloudGrad.addColorStop(1, "transparent");
      cloudCtx.fillStyle = cloudGrad;
      cloudCtx.beginPath();
      cloudCtx.ellipse(cx, cy, rx, ry, (Math.random() - 0.5) * 0.5, 0, Math.PI * 2);
      cloudCtx.fill();
    }

    const mapTexture = new THREE.CanvasTexture(canvas);
    mapTexture.wrapS = THREE.RepeatWrapping;
    mapTexture.wrapT = THREE.ClampToEdgeWrapping;

    const specTexture = new THREE.CanvasTexture(specCanvas);
    specTexture.wrapS = THREE.RepeatWrapping;
    specTexture.wrapT = THREE.ClampToEdgeWrapping;

    const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
    cloudTexture.wrapS = THREE.RepeatWrapping;
    cloudTexture.wrapT = THREE.ClampToEdgeWrapping;

    return { mapTexture, specTexture, cloudTexture };
  }, []);
}

/* ══════════════════════════════════════════
   EXPEDITION FLIGHT ARCS (Curved 3D Beams)
   Connecting photographic locations with energy pulses
══════════════════════════════════════════ */
function FlightArc({
  startLat,
  startLon,
  endLat,
  endLon,
  offset = 0,
}: {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  offset?: number;
}) {
  const p1 = latLonToVec3(startLat, startLon, R);
  const p2 = latLonToVec3(endLat, endLon, R);

  // Calculate high arc midpoint
  const mid = p1.clone().add(p2).multiplyScalar(0.5);
  const distance = p1.distanceTo(p2);
  mid.normalize().multiplyScalar(R + distance * 0.28);

  const curve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(p1, mid, p2);
  }, [p1, mid, p2]);

  const points = useMemo(() => curve.getPoints(45), [curve]);
  const lineGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  const lineObject = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(AMBER),
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    return new THREE.Line(lineGeo, mat);
  }, [lineGeo]);

  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.4 + offset) % 1;
    const pt = curve.getPoint(t);
    if (pulseRef.current) {
      pulseRef.current.position.copy(pt);
      const scale = Math.sin(t * Math.PI) * 1.2 + 0.3;
      pulseRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      {/* Curved glowing arc line */}
      <primitive object={lineObject} />

      {/* Moving energy photon along the route */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.024, 10, 10]} />
        <meshBasicMaterial color={AMBER_HI} />
      </mesh>
    </group>
  );
}

/* ══════════════════════════════════════════
   ATMOSPHERE & AURORA HALO
══════════════════════════════════════════ */
function Atmosphere() {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const breathe = Math.sin(t * 0.8) * 0.015;
    if (innerRef.current) {
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + breathe;
    }
    if (outerRef.current) {
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.045 + breathe * 0.5;
    }
  });

  return (
    <>
      {/* Inner Rayleigh Scattering Rim */}
      <mesh ref={innerRef} renderOrder={2}>
        <sphereGeometry args={[R + 0.035, 64, 64]} />
        <meshBasicMaterial
          color={AMBER_HI}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Volumetric Glow Corona */}
      <mesh ref={outerRef} renderOrder={3}>
        <sphereGeometry args={[R + 0.28, 64, 64]} />
        <meshBasicMaterial
          color={AMBER}
          transparent
          opacity={0.045}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* ══════════════════════════════════════════
   REALISTIC GLOBE SPHERE
══════════════════════════════════════════ */
function RealisticGlobeSphere() {
  const { mapTexture, specTexture, cloudTexture } = useRealisticEarthTextures();
  const cloudMesh = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (cloudMesh.current) {
      cloudMesh.current.rotation.y = t * 0.02;
    }
  });

  return (
    <>
      {/* Main High-Detail Photorealistic Earth */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[R, 64, 64]} />
        {mapTexture ? (
          <meshPhongMaterial
            map={mapTexture}
            specularMap={specTexture || undefined}
            specular={new THREE.Color(AMBER)}
            shininess={35}
            emissive={new THREE.Color("#06080d")}
          />
        ) : (
          <meshPhongMaterial
            color="#0b0e14"
            emissive="#06080d"
            specular="#1e1e1e"
            shininess={20}
          />
        )}
      </mesh>

      {/* Realistic Rotating Clouds Layer */}
      {cloudTexture && (
        <mesh ref={cloudMesh} renderOrder={4}>
          <sphereGeometry args={[R + 0.022, 64, 64]} />
          <meshPhongMaterial
            map={cloudTexture}
            transparent
            opacity={0.38}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Subtle Navigation Coordinates Cage */}
      <mesh renderOrder={2}>
        <sphereGeometry args={[R + 0.006, 28, 14]} />
        <meshBasicMaterial
          color="#c49a45"
          wireframe
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* ══════════════════════════════════════════
   COUNTRY MARKER WITH CLEAN PERMANENT LABEL
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
  const position = useMemo(
    () => latLonToVec3(country.lat, country.lon),
    [country]
  );
  const quaternion = useMemo(() => {
    const normal = position.clone().normalize();
    return new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normal
    );
  }, [position]);

  const col = active ? AMBER_HI : AMBER;
  const beamH = active ? 0.32 : 0.18;

  /* Pulsing animation + Camera facing calculation */
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime + phaseOffset;
    const p1 = (Math.sin(t * 2.5) + 1) * 0.5; // 0..1
    const p2 = (Math.sin(t * 2.5 - 1.2) + 1) * 0.5;

    if (ring1.current) {
      ring1.current.scale.setScalar(1 + p1 * 1.3);
      (ring1.current.material as THREE.MeshBasicMaterial).opacity =
        0.95 - p1 * 0.9;
    }
    if (ring2.current) {
      ring2.current.scale.setScalar(1 + p2 * 2.3);
      (ring2.current.material as THREE.MeshBasicMaterial).opacity =
        0.55 - p2 * 0.55;
    }
    if (beam.current)
      (beam.current.material as THREE.MeshBasicMaterial).opacity =
        0.25 + p1 * 0.45;
    if (dot.current)
      dot.current.scale.setScalar(active ? 1.4 : 1 + p1 * 0.18);

    // Camera facing check
    const markerNormal = position.clone().normalize();
    const camDir = camera.position.clone().normalize();
    const dotFacing = markerNormal.dot(camDir);
    const facing = dotFacing > 0.08;
    if (facing !== isFacing) {
      setIsFacing(facing);
    }
  });

  const onOver = useCallback(
    (e: ThreeEvent<PointerEvent> | React.MouseEvent) => {
      e.stopPropagation();
      setHovered(true);
      onHover(country);
      document.body.style.cursor = "pointer";
    },
    [country, onHover]
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
    [country, onClick]
  );

  const cityName = pick(lang, country.cityEn, country.cityAr);

  return (
    <group position={position} quaternion={quaternion}>
      {/* Light beam */}
      <mesh ref={beam} position={[0, beamH / 2, 0]}>
        <cylinderGeometry args={[0.005, 0.0008, beamH, 6]} />
        <meshBasicMaterial
          color={col}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Pin beacon target */}
      <mesh
        ref={dot}
        position={[0, beamH, 0]}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClk}
      >
        <sphereGeometry args={[0.032, 12, 12]} />
        <meshBasicMaterial color={col} />
      </mesh>

      {/* Concentric pulsing rings */}
      <mesh ref={ring1} renderOrder={5}>
        <torusGeometry args={[0.058, 0.007, 8, 32]} />
        <meshBasicMaterial
          color={col}
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={ring2} renderOrder={5}>
        <torusGeometry args={[0.095, 0.004, 8, 32]} />
        <meshBasicMaterial
          color={col}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>

      {/* Permanent floating City Name Label */}
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
   SCENE & NO-ZOOM ROTATION
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

  /* Fixed Camera initial position (Locked at distance 5.2) */
  useEffect(() => {
    camera.position.set(0, 1.0, CAM_DIST);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  /* Click → Rotate globe to face country WITHOUT ANY ZOOM */
  const handleClick = useCallback(
    (country: Country) => {
      const isAlreadySelected = selectedCountry?.id === country.id;
      const ctrl = controlsRef.current;

      if (isAlreadySelected) {
        if (onCountrySelect) onCountrySelect(null);
        return;
      }

      /* Rotate camera around origin at CONSTANT distance CAM_DIST (No zoom in / out) */
      const surfacePos = latLonToVec3(country.lat, country.lon);
      const dir = surfacePos.clone().normalize();
      const newPos = dir.multiplyScalar(CAM_DIST);

      if (ctrl) ctrl.enabled = false;
      gsap.to(camera.position, {
        x: newPos.x,
        y: newPos.y,
        z: newPos.z,
        duration: 1.4,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
          ctrl?.update?.();
        },
        onComplete: () => {
          if (ctrl) ctrl.enabled = true;
        },
      });

      if (onCountrySelect) onCountrySelect(country);
    },
    [camera, selectedCountry, onCountrySelect]
  );

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[6, 5, 6]}
        intensity={1.1}
        color="#ffffff"
      />
      <directionalLight
        position={[-5, -3, -5]}
        intensity={0.35}
        color={AMBER}
      />
      <pointLight
        position={[0, 8, 4]}
        intensity={0.6}
        color={AMBER_HI}
        decay={2}
      />

      {/* Cosmic Starfield */}
      <Stars
        radius={70}
        depth={60}
        count={3200}
        factor={4}
        saturation={0.1}
        fade
        speed={0.2}
      />

      {/* Realistic Earth & Atmosphere */}
      <RealisticGlobeSphere />
      <Atmosphere />

      {/* Connecting Expedition Arcs */}
      <FlightArc startLat={15.36} startLon={44.19} endLat={24.71} endLon={46.67} offset={0} />
      <FlightArc startLat={24.71} startLon={46.67} endLat={25.2} endLon={55.27} offset={0.25} />
      <FlightArc startLat={24.71} startLon={46.67} endLat={30.04} endLon={31.24} offset={0.5} />
      <FlightArc startLat={30.04} startLon={31.24} endLat={52.74} endLon={6.08} offset={0.75} />

      {/* Country Markers */}
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

      {/* Orbit Controls (ZOOM IS STRICTLY DISABLED) */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false} // NO ZOOM
        minDistance={CAM_DIST}
        maxDistance={CAM_DIST}
        autoRotate={!reduced && !selectedCountry}
        autoRotateSpeed={0.45}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.5}
        zoomSpeed={0}
      />
    </>
  );
}

/* ══════════════════════════════════════════
   PUBLIC GLOBE COMPONENT
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
      aria-label="Interactive 3D Globe"
      role="img"
      style={{ width: "100%", height, position: "relative" }}
      className="select-none touch-none"
    >
      {/* Vignette lighting overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 10,
          background:
            "radial-gradient(ellipse at center, transparent 52%, oklch(0.12 0.01 50 / 0.8) 100%)",
        }}
      />

      <Canvas
        camera={{ position: [0, 1.0, CAM_DIST], fov: 44 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
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

      {/* Subtle Hint */}
      <p
        aria-hidden
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 9,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255, 255, 255, 0.4)",
          fontFamily: "inherit",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 20,
        }}
      >
        {selectedCountry ? "انقر على المدينة لفتح المعرض" : "اسحب للتدوير · انقر على النقطة للاستكشاف"}
      </p>
    </div>
  );
}
