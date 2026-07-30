// Custom STEP worker that converts WASM objects to plain JS before postMessage
importScripts('/occt-import-js.js');

onmessage = async function (ev) {
  try {
    const occt = await occtimportjs({
      locateFile: function (path) { return '/' + path; }
    });

    const result = occt.ReadStepFile(ev.data.buffer, null);

    if (!result.success) {
      postMessage({ success: false, meshes: [] });
      return;
    }

    // Convert WASM wrapper objects to plain serializable JS
    const meshes = [];
    for (let i = 0; i < result.meshes.size(); i++) {
      const mesh = result.meshes.get(i);
      const plainMesh = {};

      // Color
      if (mesh.color) {
        try { plainMesh.color = [mesh.color.r, mesh.color.g, mesh.color.b]; } catch(e) {}
      }

      // Position attribute
      try {
        const pos = mesh.attributes.position;
        const posArr = pos.array;
        const posData = new Float32Array(posArr.size());
        for (let j = 0; j < posArr.size(); j++) posData[j] = posArr.get(j);
        plainMesh.positions = posData;
      } catch(e) {
        plainMesh.positions = new Float32Array(0);
      }

      // Normal attribute
      try {
        const nrm = mesh.attributes.normal;
        if (nrm) {
          const nrmArr = nrm.array;
          const nrmData = new Float32Array(nrmArr.size());
          for (let j = 0; j < nrmArr.size(); j++) nrmData[j] = nrmArr.get(j);
          plainMesh.normals = nrmData;
        }
      } catch(e) {}

      // Index
      try {
        const idx = mesh.index;
        if (idx) {
          const idxArr = idx.array;
          const idxData = new Uint32Array(idxArr.size());
          for (let j = 0; j < idxArr.size(); j++) idxData[j] = idxArr.get(j);
          plainMesh.indices = idxData;
        }
      } catch(e) {}

      meshes.push(plainMesh);
    }

    postMessage(
      { success: true, meshes },
      // Transfer buffers for performance
      meshes.flatMap(m => [
        m.positions?.buffer,
        m.normals?.buffer,
        m.indices?.buffer,
      ].filter(Boolean))
    );
  } catch(e) {
    postMessage({ success: false, error: e.message, meshes: [] });
  }
};
