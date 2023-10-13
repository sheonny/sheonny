import vtkPoints from "@kitware/vtk.js/Common/Core/Points";
import vtkCellArray from "@kitware/vtk.js/Common/Core/CellArray";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData";
import macro from "@kitware/vtk.js/macros";
import { mat4 } from "gl-matrix";
import vtkMatrixBuilder from "@kitware/vtk.js/Common/Core/MatrixBuilder";

function vtkCross2DSource(publicAPI, model) {
  // Set our classname
  model.classHierarchy.push("vtkCross2DSource");

  function requestData(inData, outData) {
    if(model.deleted) {
      return;
    }

    let dataset = outData[0];
    const pts = vtkPoints.newInstance();
    const lines = vtkCellArray.newInstance();
    const polys = vtkCellArray.newInstance();
    function createCross(pts, lines, polys, scale, dot, normal) {
      console.log(normal);
      const ptIds = new Array(2);
      const radius = 0.5 * scale;
      let gapRadius = 0.2 * scale;
      if(dot) {
          gapRadius *= 1.5;
      };
        ptIds[0] = pts.insertNextPoint(-radius, 0.0, 0.0);
        ptIds[1] = pts.insertNextPoint(-gapRadius, 0.0, 0.0);
        lines.insertNextCell(ptIds);

        ptIds[0] = pts.insertNextPoint(gapRadius, 0.0, 0.0);
        ptIds[1] = pts.insertNextPoint(radius, 0.0, 0.0);
        lines.insertNextCell(ptIds);

        ptIds[0] = pts.insertNextPoint(0.0, -radius, 0.0);
        ptIds[1] = pts.insertNextPoint(0.0, -gapRadius, 0.0);
        lines.insertNextCell(ptIds);

        ptIds[0] = pts.insertNextPoint(0.0, gapRadius, 0.0);
        ptIds[1] = pts.insertNextPoint(0.0, radius, 0.0);
        lines.insertNextCell(ptIds);

        if(dot) {
          const centerPoint = [];
          centerPoint.push(pts.insertNextPoint(-radius * 0.1, radius * 0.1, 0));
          centerPoint.push(pts.insertNextPoint(radius * 0.1, radius * 0.1, 0));
          centerPoint.push(pts.insertNextPoint(radius * 0.1, -radius * 0.1, 0));
          centerPoint.push(pts.insertNextPoint(-radius * 0.1, -radius * 0.1, 0));
          centerPoint.push(pts.insertNextPoint(-radius * 0.1, radius * 0.1, 0));
          polys.insertNextCell(centerPoint);
          }
      }

    createCross(pts, lines, polys, model.scale, model.dot, model.normal);

    dataset = vtkPolyData.newInstance();
    // dataset.setPoints(pts);
    const matrix = mat4.create(new Float32Array(16));
    if(model.normal && model.normal.length === 3) {
      const { normal } = model;
      normal.forEach((item, index) => {
        if(item > 0) {
          switch (index) {
            case 0:
              mat4.rotateY(matrix, matrix, 90 * Math.PI / 180);
              break;
            case 1:
              mat4.rotateX(matrix, matrix, 30);
              break;
            default:
              break;
          }
        }
      });
    }
    console.log(matrix, pts);
    const points = pts.getData().slice();
    console.log(points);
    vtkMatrixBuilder.buildFromDegree().setMatrix(matrix).apply(points);
    pts.setData(points);
    dataset.setPoints(pts);
    if(model.lines) {
      dataset.setLines(lines);
    }
    if(model.face) {
      dataset.setPolys(polys);
    }
    // Update output
    outData[0] = dataset;
    console.log(dataset.getPoints().getData().slice(), "poly");
  }

  // Expose methods
  publicAPI.requestData = requestData;
  publicAPI.setNormal = (...normal) => {
    let n = [];
    if(normal.length === 1 || Array.isArray(normal[0])) {
        n = [...normal[0]];
        } else if(normal.length === 3) {
        n = [normal[0], normal[1], normal[2]];
    }
    console.log(n);
  };
}
function defaultValues(initialValues) {
  return {
    face: true,
    lines: true,
    scale: 1.0,
    dot: true,
    normal: [0, 0, 1],
    ...initialValues
  };
}
export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, defaultValues(initialValues));

  // Build VTK API
  macro.obj(publicAPI, model);
  macro.algo(publicAPI, model, 0, 1);
  vtkCross2DSource(publicAPI, model);
}
// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend, "vtkCross2DSource");

// ----------------------------------------------------------------------------

export default { newInstance, extend };
