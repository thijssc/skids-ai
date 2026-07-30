declare module 'occt-import-js' {
  interface OcctMeshAttribute { array: number[] }
  interface OcctMesh {
    index?: { array: number[] }
    color?: [number, number, number]
    attributes: {
      position: OcctMeshAttribute
      normal?: OcctMeshAttribute
    }
  }
  interface OcctResult {
    success: boolean
    meshes: OcctMesh[]
  }
  interface OcctInstance {
    ReadStepFile(buffer: Uint8Array, params: null): OcctResult
  }
  function initOcct(options?: { locateFile?: (f: string) => string }): Promise<OcctInstance>
  export default initOcct
}
