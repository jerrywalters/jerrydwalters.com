#!/usr/bin/env bash
#
# Convert a high-resolution STL into a tiny, web-ready GLB for the r3f scene.
#
#   scripts/stl-to-glb.sh <input.stl> <output.glb> [simplify-ratio]
#
# Defaults to keeping ~40% of the triangles. The output is centered, scaled so
# its longest dimension spans 2 units, and position-quantized
# (KHR_mesh_quantization — decoded natively by three.js, no runtime decoder).
# Colour/orientation are NOT baked in: the scene recolours via a
# MeshStandardMaterial and `flatShading` derives the faceted "carved" look, so
# we deliberately don't store normals or materials here.
#
# Requires: python3 + trimesh, and npx (@gltf-transform/cli is fetched on demand).
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <input.stl> <output.glb> [simplify-ratio=0.4]" >&2
  exit 1
fi

IN="$1"
OUT="$2"
RATIO="${3:-0.4}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "▸ 1/3  STL → GLB (weld, center, normalize)…"
python3 - "$IN" "$TMP/raw.glb" <<'PY'
import sys, trimesh
inp, out = sys.argv[1], sys.argv[2]
m = trimesh.load(inp, force='mesh')
m.merge_vertices()                           # weld duplicate vertices
m.apply_translation(-m.bounds.mean(axis=0))  # center on bounding-box center
m.apply_scale(2.0 / m.extents.max())         # normalize: longest axis → 2 units
# Export geometry only (positions + indices). No normals → smaller file, and the
# scene's flatShading recomputes facet normals anyway.
trimesh.Trimesh(vertices=m.vertices, faces=m.faces, process=False).export(out)
PY

echo "▸ 2/3  simplify → ${RATIO} of triangles (meshoptimizer)…"
npx --yes @gltf-transform/cli simplify "$TMP/raw.glb" "$TMP/simplified.glb" \
  --ratio "$RATIO" --error 0.001

echo "▸ 3/3  quantize positions → 16-bit (KHR_mesh_quantization)…"
npx --yes @gltf-transform/cli quantize "$TMP/simplified.glb" "$OUT"

echo "✓ wrote $OUT"
npx --yes @gltf-transform/cli inspect "$OUT" 2>/dev/null \
  | grep -E "glPrimitives|extensionsUsed|POSITION" || true
ls -lh "$OUT" | awk '{print "  size:", $5}'
